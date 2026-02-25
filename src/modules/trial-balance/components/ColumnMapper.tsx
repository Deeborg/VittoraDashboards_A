import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography, // Added Typography import
} from '@mui/material';
import TextField from '@mui/material/TextField';
import Papa from 'papaparse';
import { FinancialRow, MappedRow, TextRow } from './Types/types';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// The raw data from the uploaded file can have any keys.
type RawRow = Record<string, any>;

type ExistingGL = {
  glAccount: string|any; // Allow number initially to handle various data sources
  glName: string;
  'Level 1 Desc': string;
  'Level 2 Desc': string;
};

type FinancialMapConfig = {
  key: 'key';
  amountCurrent: 'currentAmount';
  amountPrevious: 'previousAmount';
};

type TextVarConfig = {
  key: 'Keys';
  amountCurrent: 'currentAmount';
};

type Props = {
  columns: string[];
  rawData: RawRow[];
  onConfirm: (mappedData: MappedRow[], amountCurrentKey: string, amountPreviousKey: string) => void;
};

const periodTypes = ['Financial Year Ended (FYE)', 'Quarter Ended (QE)', 'Year to Date (YTD)', 'Calendar Year Ended (CYE)'] as const;
type AmountMeta = {
  periodType: string;
  date: string;
};
const initialAmountMeta: Record<'amountCurrent' | 'amountPrevious', AmountMeta> = {
  amountCurrent: { periodType: '', date: '' },
  amountPrevious: { periodType: '', date: '' },
};

const ColumnMapper: React.FC<Props> = ({ columns, rawData, onConfirm }) => {
  const fields: { key: keyof MappedRow; label: string; aliases: string[] }[] = [
    { key: 'glAccount', label: 'G/L Account', aliases: ['Account Code', 'G/L Account', 'G/L Acct'] },
    { key: 'glName', label: 'GL Description', aliases: ['Name', 'Created by'] },
    { key: 'Level 1 Desc', label: 'Level 1 Description', aliases: ['Level 1 grouping', 'Level 1 Desc'] },
    { key: 'Level 2 Desc', label: 'Level 2 Description', aliases: ['Level 2 grouping', 'Level 2 Desc'] },
    { key: 'accountType', label: 'Account Type', aliases: ['Nature', 'P&L Statement Acct Type'] },
    { key: 'functionalArea', label: 'Target Grouping', aliases: ['Target Grouping', 'Functional Area'] },
    { key: 'amountCurrent', label: 'Amount (Current Period)', aliases: ['Amount'] },
    { key: 'amountPrevious', label: 'Amount (Comparitive Period)', aliases: ['Amount'] },
  ];

  const getInitialMap = () => {
    const autoMap: Partial<Record<keyof MappedRow, string>> = {};
    fields.forEach(field => {
      const foundAlias = field.aliases.find(alias =>
        columns.some(c => c.trim().toLowerCase() === alias.trim().toLowerCase())
      );
      if (foundAlias) {
        const matchingColumn = columns.find(c => c.trim().toLowerCase() === foundAlias.trim().toLowerCase());
        if (matchingColumn) {
          autoMap[field.key] = matchingColumn;
        }
      }
    });
    return autoMap;
  };

  const [map, setMap] = useState<Partial<Record<keyof MappedRow, string>>>(getInitialMap);
  const [amountMeta, setAmountMeta] = useState(initialAmountMeta);
  const [financialVar, setFinancialVar] = useState<any[]>([]);
  const [textVar, setTextVar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('');
  const [dialogContent, setDialogContent] = useState<string[]>([]);
  const [existingGLs, setExistingGLs] = useState<ExistingGL[]>([]);

  // --- State for the New G/L Mapping Dialog ---
  const [isNewGLDialogOpen, setIsNewGLDialogOpen] = useState(false);
  const [newGLsToMap, setNewGLsToMap] = useState<{ glAccount: string; glName: string }[]>([]);
  const [newGLMappings, setNewGLMappings] = useState<Record<string, { level1: string; level2: string }>>({});
  const [transientMappedData, setTransientMappedData] = useState<any[] | null>(null);
  const [existingLevel1, setExistingLevel1] = useState<string[]>([]);
  const [existingLevel2, setExistingLevel2] = useState<string[]>([]);

  const cleanAmount = (value: any): number => {
    if (typeof value !== "string" && typeof value !== "number") return 0;
    if (typeof value === "number") return value;
    const cleaned = value.replace(/[^0-9.-]/g, "");
    return parseFloat(cleaned) || 0;
  };

  useEffect(() => {
    const FetchFVs = async () => {
        try {
            const response = await fetch('/Manual_Variables_List.csv');
            const text = await response.text();
            const data = Papa.parse(text, { header: true }).data;
            setFinancialVar(data);
            const response1 = await fetch('/Text_Keys.csv');
            const text1 = await response1.text();
            const data1 = Papa.parse(text1, { header: true }).data;
            setTextVar(data1);
        } catch (error) {
            console.error('Error fetching CSV files:', error);
        } finally {
            setLoading(false);
        }
    };
    FetchFVs();

    const fetchExistingGLData = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/data");
        // --- FIX: Assert the type of the fetched data here ---
        const data = await response.json() as ExistingGL[]; 
        setExistingGLs(data);

        // --- Now, TypeScript knows `data` is an array of ExistingGL objects ---
        // So, it correctly infers that .map() will produce strings.
        const level1s = new Set(data.map((gl: ExistingGL) => gl['Level 1 Desc']));
        const level2s = new Set(data.map((gl: ExistingGL) => gl['Level 2 Desc']));
        console.log(level1s,level2s)
        setExistingLevel1(Array.from(level1s));
        setExistingLevel2(Array.from(level2s));

    } catch (error) {

            console.error("Error fetching journal entry/vars:", error);
        }
    };
    fetchExistingGLData();
  }, []);

  const financialMap: FinancialMapConfig = {
    key: 'key',
    amountCurrent: 'currentAmount',
    amountPrevious: 'previousAmount',
  };
  const textMap: TextVarConfig = {
    key: 'Keys',
    amountCurrent: 'currentAmount',
  };

  const proceedWithFinalConfirmation = async (finalMappedData: any[]) => {
    const amountCurrentKey = `${amountMeta.amountCurrent.periodType} ${amountMeta.amountCurrent.date}`;
    const amountPreviousKey = `${amountMeta.amountPrevious.periodType} ${amountMeta.amountPrevious.date}`;



    const financialVar1: FinancialRow[] = financialVar.map((row) => {
      const getValue = (key: keyof FinancialRow, defaultValue: string | number = '') => {
        const mappedColumn = financialMap[key];
        return mappedColumn ? row[mappedColumn] ?? defaultValue : defaultValue;
      };
      const getAmount = (key: keyof FinancialRow, dynamicKey: string) => {
        if (dynamicKey in row && row[dynamicKey] != null) return cleanAmount(row[dynamicKey]);
        return cleanAmount(getValue(key, 0));
      };
      return {
        key: getValue('key', '') as string,
        [amountCurrentKey]: getAmount('amountCurrent', amountCurrentKey),
        [amountPreviousKey]: getAmount('amountPrevious', amountPreviousKey),
      } as FinancialRow;
    });

    const textVar1: TextRow[] = textVar.map((row) => {
      const getMappedValue = (mappedColumn: string | undefined): string => {
        if (mappedColumn && row.hasOwnProperty(mappedColumn)) {
          const value = row[mappedColumn];
          return value !== null && value !== undefined && value !== '0' ? value.toString() : '';
        }
        return '';
      };
      const getAmountValue = (amountKey: string): string | null => {
        if (row.hasOwnProperty(amountKey) && row[amountKey] != null) {
          return cleanAmount(row[amountKey]).toString();
        }
        return null;
      };
      const keyColumn = textMap['key'];
      const keyValue = getMappedValue(keyColumn);
      const amountValue = getAmountValue(amountCurrentKey);
      return {
        key: keyValue,
        [amountCurrentKey]: amountValue,
      } as TextRow;
    });

    
    console.log("finalMappedData",finalMappedData)
    onConfirm(finalMappedData, amountCurrentKey, amountPreviousKey);

    try {
      let shouldOverwriteAll = false;
      let hasDuplicatesInTrialBalanceOrAdj = false;
      let renameMap: Record<string, string> = {}; // Placeholder for future rename functionality

      // --- STEP 1: Check for duplicates ONLY in trial_balance and adjustment_entries FIRST ---
      // We send the data without 'overwrite: true' initially to get a duplicate report
      const initialTrialBalanceRes = await fetch('http://localhost:5000/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalMappedData }), // No overwrite flag here yet
      });

      if (initialTrialBalanceRes.status === 409) {
        // Duplicates found in trial_balance or adjustment_entries
        const data = await initialTrialBalanceRes.json();
        const trialBalanceDupes = data.duplicates.trial_balance || [];
        const adjEntriesDupes = data.duplicates.adjustment_entries || [];

        if (trialBalanceDupes.length > 0 || adjEntriesDupes.length > 0) {
          hasDuplicatesInTrialBalanceOrAdj = true;
          let duplicateMessage = '';
          if (trialBalanceDupes.length > 0) {
            duplicateMessage += `Trial Balance: ${trialBalanceDupes.join(", ")}\n`;
          }
          if (adjEntriesDupes.length > 0) {
            duplicateMessage += `Adjustment Entries: ${adjEntriesDupes.join(", ")}\n`;
          }

          // Prompt user for overwrite decision
          const userChoice = window.confirm(
            `Duplicate columns found in the main data (Trial Balance/Adjustment Entries):\n${duplicateMessage}\n\nClick OK to OVERWRITE these columns (and proceed with overwriting any duplicates in other tables), or Cancel to ABORT all uploads.`
          );

          if (userChoice) {
            shouldOverwriteAll = true;
          } else {
            alert("Upload aborted by user due to duplicates.");
            return; // Stop the entire process if user chooses not to overwrite
          }
        }
      } else if (!initialTrialBalanceRes.ok) {
        // Handle other non-409 errors during the initial check
        throw new Error(`Error with initial main data check: ${initialTrialBalanceRes.status} ${initialTrialBalanceRes.statusText}`);
      }
      // If initialTrialBalanceRes.ok (and not 409), it means no duplicates were found,
      // and we proceed without the overwrite flag (shouldOverwriteAll remains false).


      // --- STEP 2: Proceed with all API calls, applying 'overwrite' flag based on user's decision ---
      const uploadPromises = [];

      // Always re-send /api/data, now with the correct overwrite flag
      uploadPromises.push(
        fetch('http://localhost:5000/api/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ finalMappedData, overwrite: shouldOverwriteAll}),
        })
      );

      // Send financial_variables1 data with the same overwrite flag
      uploadPromises.push(
        fetch('http://localhost:5000/api/financialvar-updated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ financialVar1, overwrite: shouldOverwriteAll}),
        })
      );

      // Send text_keys1 data with the same overwrite flag
      uploadPromises.push(
        fetch('http://localhost:5000/api/text-variables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textVar1, overwrite: shouldOverwriteAll }),
        })
      );

      const responses = await Promise.all(uploadPromises);

      // Check if any of the final upload requests failed (excluding initial 409 if handled)
      // Any response that is not 'ok' and not a 409 (which is specifically handled by our logic) is an error.
      const failedResponses = responses.filter(res => !res.ok && res.status !== 409);
      if (failedResponses.length > 0) {
        const errorMessages = await Promise.all(failedResponses.map(res => res.text()));
        throw new Error(`One or more uploads failed after initial check: ${errorMessages.join('; ')}`);
      }

      // Provide final user feedback
      if (hasDuplicatesInTrialBalanceOrAdj && shouldOverwriteAll) {
        alert("All data inserted with overwrite ✅");
      } else if (!hasDuplicatesInTrialBalanceOrAdj) {
        alert("All data uploaded successfully 🎉");
      }
      // If hasDuplicatesInTrialBalanceOrAdj is true but !shouldOverwriteAll,
      // the function would have returned earlier with the "Upload aborted" alert.

    } catch (err) {
      console.error("Error during data upload:", err);
      alert("Failed to send data to the server. Please check the console for details.");
    }
  };

  const handleNewGLMappingConfirm = () => {
    // Validate that all new GLs have been mapped
    const allMapped = newGLsToMap.every(
      gl => newGLMappings[gl.glAccount]?.level1 && newGLMappings[gl.glAccount]?.level2
    );

    if (!allMapped) {
      alert("Please provide both Level 1 and Level 2 descriptions for all new G/L accounts.");
      return;
    }

    if (!transientMappedData) return;

    // Merge the new mappings into the data
    const updatedMappedData = transientMappedData.map(row => {
      const glAccountStr = String(row.glAccount);
      if (newGLMappings[glAccountStr]) {
        return {
          ...row,
          'Level 1 Desc': newGLMappings[glAccountStr].level1,
          'Level 2 Desc': newGLMappings[glAccountStr].level2,
        };
      }
      return row;
    });
    console.log("mappedData",updatedMappedData)
    // Reset states and proceed
    setIsNewGLDialogOpen(false);
    setTransientMappedData(null);
    proceedWithFinalConfirmation(updatedMappedData);
  };
  
  const handleConfirm = async () => {
    const requiredFields: (keyof MappedRow)[] = ['glAccount', 'glName', 'amountCurrent'];
    if (!map['Level 1 Desc'] || !map['Level 2 Desc']) {
        // If Level 1/2 are NOT mapped, they are not required initially
    } else {
        requiredFields.push('Level 1 Desc', 'Level 2 Desc');
    }

    const allRequiredMapped = requiredFields.every(field => !!map[field]);
    if (!allRequiredMapped) {
      setDialogTitle("Required Fields Missing");
      setDialogContent(["Please ensure G/L Account, G/L Name, and Amount (Current Period) are mapped."]);
      setIsDialogOpen(true);
      return;
    }

    const currentAmountColumnName = map['amountCurrent'];
    const previousAmountColumnName = map['amountPrevious'];

    let currentTotal = 0;
    if (currentAmountColumnName) {
      currentTotal = rawData.reduce((sum, row) => sum + cleanAmount(row[currentAmountColumnName]), 0);
    }
    let previousTotal = 0;
    if (previousAmountColumnName) {
      previousTotal = rawData.reduce((sum, row) => sum + cleanAmount(row[previousAmountColumnName]), 0);
    }

    const roundedCurrentTotal = parseFloat(currentTotal.toFixed(0));
    const roundedPreviousTotal = parseFloat(previousTotal.toFixed(0));

    let errorMessages: string[] = [];
    if (currentAmountColumnName && roundedCurrentTotal !== 0) {
      errorMessages.push(`The "Amount (Current Period)" column ('${currentAmountColumnName}') does not sum to zero. The calculated sum is ${currentTotal.toFixed(0)}.`);
    }
    if (previousAmountColumnName && roundedPreviousTotal !== 0) {
      errorMessages.push(`The "Amount (Previous Period)" column ('${previousAmountColumnName}') does not sum to zero. The calculated sum is ${previousTotal.toFixed(0)}.`);
    }

    if (errorMessages.length > 0) {
      // --- UPDATED: Replaced alert with MUI Dialog ---
      setDialogTitle("Validation Error");
      setDialogContent([
        "The trial balance is not balanced.",
        ...errorMessages,
        "Please check your uploaded file or column mappings."
      ]);
      setIsDialogOpen(true);
      return;
    }


    const amountCurrentKey = `${amountMeta.amountCurrent.periodType} ${amountMeta.amountCurrent.date}`;
    const amountPreviousKey = `${amountMeta.amountPrevious.periodType} ${amountMeta.amountPrevious.date}`;

    const mappedData: any[] = rawData.map((row) => {
        const getValue = (key: keyof MappedRow, defaultValue: any = '') => {
            const mappedColumn = map[key];
            return mappedColumn ? row[mappedColumn] ?? defaultValue : defaultValue;
        };
        return {
            glName: getValue('glName'),
            glAccount: getValue('glAccount'),
            accountType: getValue('accountType'),
            'Level 1 Desc': getValue('Level 1 Desc'),
            'Level 2 Desc': getValue('Level 2 Desc'),
            functionalArea: getValue('functionalArea'),
            [amountCurrentKey]: cleanAmount(getValue('amountCurrent', 0)),
            [amountPreviousKey]: cleanAmount(getValue('amountPrevious', 0)),
        };
    });

    if (existingGLs.length > 0 && map['glAccount']) {
        const uploadedGLs = new Set(mappedData.map(row => String(row.glAccount)));
        const existingGLSet = new Set(existingGLs.map(gl => String(gl.glAccount)));
        const newGLsNotInExisting = Array.from(uploadedGLs).filter(gl => !existingGLSet.has(gl));

        if (newGLsNotInExisting.length > 0) {
            const glsNeedingMapping = newGLsNotInExisting.map(glAccount => {
                const rowData = mappedData.find(row => String(row.glAccount) === glAccount);
                return { glAccount, glName: rowData?.glName || 'N/A' };
            });

            // Only open dialog if there are genuinely unmapped new accounts
            if (glsNeedingMapping.length > 0) {
                setNewGLsToMap(glsNeedingMapping);
                // Pre-fill mappings state object
                const initialMappings = glsNeedingMapping.reduce((acc, gl) => {
                    acc[gl.glAccount] = { level1: '', level2: '' };
                    return acc;
                }, {} as Record<string, {level1: string, level2: string}>);
                setNewGLMappings(initialMappings);

                setTransientMappedData(mappedData); // Save current data
                setIsNewGLDialogOpen(true); // Open dialog
                return; // Stop and wait for user input
            }
        }
    }
    
    proceedWithFinalConfirmation(mappedData);
  };

  return (
    <Paper sx={{ p: 3, mt: 3, maxWidth: 1500, mx: 'auto' }}>
      {/* Form layout remains unchanged */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2 }}>
        {fields.filter(field => field.key !== 'amountCurrent' && field.key !== 'amountPrevious').map(field => (
          <FormControl key={field.key} fullWidth variant="outlined">
            <InputLabel>{field.label}</InputLabel>
            <Select value={map[field.key] ?? ''} onChange={e => setMap(prev => ({ ...prev, [field.key]: e.target.value }))} label={field.label}>
              <MenuItem value=""><em>None (Skip this field)</em></MenuItem>
              {columns.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
            </Select>
          </FormControl>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'flex-start' }}>
        <FormControl variant="outlined" sx={{ minWidth: 260, flex: 1 }}>
          <InputLabel>Amount (Current Period)</InputLabel>
          <Select value={map['amountCurrent'] ?? ''} onChange={e => setMap(prev => ({ ...prev, amountCurrent: e.target.value }))} label="Amount (Current Period)">
            <MenuItem value=""><em>None (Skip this field)</em></MenuItem>
            {columns.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 260, flex: 1 }}>
          <InputLabel shrink>Type</InputLabel>
          <Select value={amountMeta.amountCurrent.periodType} label="Type" onChange={e => setAmountMeta(prev => ({ ...prev, amountCurrent: { ...prev.amountCurrent, periodType: e.target.value } }))} displayEmpty>
            {periodTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Date" type="date" sx={{ minWidth: 260, flex: 1 }} value={amountMeta.amountCurrent.date} onChange={e => setAmountMeta(prev => ({ ...prev, amountCurrent: { ...prev.amountCurrent, date: e.target.value } }))} InputLabelProps={{ shrink: true }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 2, alignItems: 'flex-start' }}>
        <FormControl variant="outlined" sx={{ minWidth: 260, flex: 1 }}>
          <InputLabel>Amount (Previous Period)</InputLabel>
          <Select value={map['amountPrevious'] ?? ''} onChange={e => setMap(prev => ({ ...prev, amountPrevious: e.target.value }))} label="Amount (Previous Period)">
            <MenuItem value=""><em>None (Skip this field)</em></MenuItem>
            {columns.map(col => <MenuItem key={col} value={col}>{col}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 260, flex: 1 }}>
          <InputLabel shrink>Type</InputLabel>
          <Select value={amountMeta.amountPrevious.periodType} label="Type" onChange={e => setAmountMeta(prev => ({ ...prev, amountPrevious: { ...prev.amountPrevious, periodType: e.target.value } }))} displayEmpty>
            {periodTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="Date" type="date" sx={{ minWidth: 260, flex: 1 }} value={amountMeta.amountPrevious.date} onChange={e => setAmountMeta(prev => ({ ...prev, amountPrevious: { ...prev.amountPrevious, date: e.target.value } }))} InputLabelProps={{ shrink: true }} />
      </Box>

      <Button variant="contained" color="primary" size="large" sx={{ mt: 3, display: 'block', mx: 'auto' }} onClick={handleConfirm}>
        ✅ Confirm Mapping & Generate Statements
      </Button>

      {/* --- UPDATED: Dialog Component for All Messages --- */}
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)} aria-labelledby="dialog-title">
        <DialogTitle id="dialog-title" sx={{ display: 'flex', alignItems: 'center' }}>
          <WarningAmberIcon sx={{ mr: 1, color: dialogTitle.includes('Error') ? 'error.main' : 'primary.main' }} />
          {dialogTitle}
        </DialogTitle>
        <DialogContent>
          {dialogContent.map((line, index) => (
            <DialogContentText key={index} sx={{ mb: 1.5 }}>
              {line}
            </DialogContentText>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} autoFocus variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* --- New Dialog for Mapping New G/L Accounts --- */}
      <Dialog open={isNewGLDialogOpen} onClose={() => setIsNewGLDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Map New G/L Accounts</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            The following G/L accounts were not found. Please classify them before proceeding.
          </DialogContentText>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, borderBottom: '1px solid #ccc', pb: 1, gap: 2 }}>
            <Box sx={{ width: '33.33%' }}><Typography fontWeight="bold">G/L Account</Typography></Box>
            <Box sx={{ width: '33.33%' }}><Typography fontWeight="bold">Level 1 Description</Typography></Box>
            <Box sx={{ width: '33.33%' }}><Typography fontWeight="bold">Level 2 Description</Typography></Box>
          </Box>

          {newGLsToMap.map(glRow => {
            const glAccount = String(glRow.glAccount);
            return (
              <Box key={glAccount} sx={{ display: 'flex', alignItems: 'center', my: 2, gap: 2 }}>
                <Box sx={{ width: '33.33%' }}>
                  <Typography>{glAccount}</Typography>
                  <Typography variant="caption" color="textSecondary">{glRow.glName}</Typography>
                </Box>
                <Box sx={{ width: '33.33%' }}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Select Level 1</InputLabel>
                    <Select
                      value={newGLMappings[glAccount]?.level1 || ''}
                      onChange={e => setNewGLMappings(prev => ({
                        ...prev,
                        [glAccount]: { ...prev[glAccount], level1: e.target.value }
                      }))}
                      label="Select Level 1"
                    >
                      {existingLevel1.map(desc => <MenuItem key={desc} value={desc}>{desc}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ width: '33.33%' }}>
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Select Level 2</InputLabel>
                    <Select
                      value={newGLMappings[glAccount]?.level2 || ''}
                      onChange={e => setNewGLMappings(prev => ({
                        ...prev,
                        [glAccount]: { ...prev[glAccount], level2: e.target.value }
                      }))}
                      label="Select Level 2"
                    >
                      {existingLevel2.map(desc => <MenuItem key={desc} value={desc}>{desc}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewGLDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleNewGLMappingConfirm} variant="contained">
            Confirm Mappings
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );
};

export default ColumnMapper;
