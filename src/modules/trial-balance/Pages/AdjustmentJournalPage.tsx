import React, { useState, useEffect } from "react";
import axios from "axios";
import { JournalRow, GLAccountInfo } from "./types"
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Autocomplete,
  TextField,
  Box,
  CardContent,
  Card,
  Typography,
  Stack,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Paper,
  Tabs,
  Tab,
  Checkbox,
  Chip,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";


const API_URL = "http://localhost:5000/api/journal";


interface AdjustmentJournalPageProps {
  onBack: () => void;
}

const AdjustmentJournalPage: React.FC<AdjustmentJournalPageProps> = ({
  onBack,
}) => {
  const [showEntryControls, setShowEntryControls] = useState(false);
  const [rows, setRows] = useState<JournalRow[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [allGlAccounts, setAllGlAccounts] = useState<GLAccountInfo[]>([]);
  const [allPeriods, setAllPeriods] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autocompleteKey, setAutocompleteKey] = useState(0);
  const [batchNarration, setBatchNarration] = useState("");

  const [showEntriesDialog, setShowEntriesDialog] = useState(false);
  const [entryPeriods, setEntryPeriods] = useState<string[]>([]);
  const [selectedEntryPeriod, setSelectedEntryPeriod] = useState<string | null>(null);
  const [entryList, setEntryList] = useState<any[]>([]);
  const [pendingEntries, setPendingEntries] = useState<any[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<number[]>([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [expandedHeaders, setExpandedHeaders] = useState<Set<string>>(new Set());
  const [expandedViewHeaders, setExpandedViewHeaders] = useState<Set<string>>(new Set());
  const [adminComment, setAdminComment] = useState("");

  // ADDED: State to simulate the current non-admin user.
  // In a real app, this would come from an auth context.
  const [currentUser, setCurrentUser] = useState<string>("standard_user");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get<{
          glAccounts: GLAccountInfo[];
          periods: string[];
        }>(`${API_URL}/metadata`);
        setAllGlAccounts(response.data.glAccounts || []);
        setAllPeriods(response.data.periods || []);
        setError(null);
      } catch (err) {
        setError("Failed to fetch data from the server.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchEntryPeriods = async () => {
      const res = await axios.get(`${API_URL}/entries`);
      setEntryPeriods(res.data.periods || []);
    };

    fetchMetadata();
    fetchEntryPeriods();
    if (adminLoggedIn) {
      fetchPendingEntries();
    }
  }, [adminLoggedIn]);

  const fetchPendingEntries = async () => {
    try {
      const res = await axios.get(`${API_URL}/pending-entries`);
      setPendingEntries(res.data.entries || []);
    } catch (err) {
      console.error("Error fetching pending entries:", err);
    }
  };

  const handleAddRow = () => {
    const newRow: JournalRow = {
      id: uuidv4(),
      selectedGlAccount: null,
      transactionType: "Debit",
      amounts: {},
    };
    setRows([...rows, newRow]);
  };

  const handleAdminLogin = (username: string) => {
    setAdminLoggedIn(true);
    setAdminUsername(username);
    setShowAdminLogin(false);
    setCurrentUser(username); // ADDED: Set current user to admin
  };


  const handleAddPeriod = (period: string) => {
    if (period && !selectedPeriods.includes(period)) {
      setSelectedPeriods([...selectedPeriods, period]);
    }
  };

  const handleRowChange = (id: string, updatedValues: Partial<JournalRow>) => {
    setRows(
      rows.map((row) => (row.id === id ? { ...row, ...updatedValues } : row))
    );
  };

  const handleAmountChange = (rowId: string, period: string, value: string) => {
    const newAmount = value === "" ? "" : parseFloat(value);
    setRows(
      rows.map((row) =>
        row.id === rowId
          ? { ...row, amounts: { ...row.amounts, [period]: newAmount } }
          : row
      )
    );
  };

  const handlePostEntries = async () => {
    setIsPosting(true);
    setError(null);
    const entries = [];
    for (const row of rows) {
      if (!row.selectedGlAccount) continue;
      for (const period of selectedPeriods) {
        const amount = row.amounts[period];
        if (typeof amount === "number" && !isNaN(amount)) {
          const value =
            row.transactionType === "Credit"
              ? -Math.abs(amount)
              : Math.abs(amount);
          entries.push({ glAccount: row.selectedGlAccount, period, value });
        }
      }
    }
    if (entries.length === 0) {
      setError("No valid entries to post.");
      setIsPosting(false);
      return;
    }
    try {
      // CHANGED: Include created_by field
      const response = await axios.post(`${API_URL}/batch-update`, {
        entries,
        narration: batchNarration || "No narration provided",
        createdBy: currentUser,
      });
      setMessage({ type: 'success', text: response.data.msg });
      setRows([]);
      setSelectedPeriods([]);
      setBatchNarration("");
      setShowEntryControls(false);
    } catch (err) {
      setError("Failed to post entries. Please try again.");
      console.error(err);
    } finally {
      setIsPosting(false);
    }
  };

  

  const handleApproveSelected = async () => {
    if (selectedEntries.length === 0) {
      setMessage({ type: 'error', text: 'Please select entries to approve' });
      return;
    }
    if (!adminUsername || typeof adminUsername !== 'string') {
      setMessage({ type: 'error', text: 'Admin username is invalid' });
      return;
    }

    const validEntryIds = selectedEntries.filter(id => Number.isInteger(id));
    if (validEntryIds.length === 0) {
      setMessage({ type: 'error', text: 'No valid entry IDs selected' });
      return;
    }

    setIsPosting(true);
    try {
      const response = await axios.post(`${API_URL}/approve-entries`, {
        entryIds: validEntryIds,
        approvedBy: adminUsername,
        narration: adminComment // added

      });
      setMessage({ type: 'success', text: response.data.msg });
      setSelectedEntries([]);
      await fetchPendingEntries();
    } catch (err) {
      console.error("Error approving entries:", err);
      setMessage({ type: 'error', text: 'Failed to approve entries' });
    } finally {
      setIsPosting(false);
    }
  };

  const handleRejectSelected = async () => {
    if (selectedEntries.length === 0) {
      setMessage({ type: 'error', text: 'Please select entries to reject' });
      return;
    }
    if (!adminUsername || typeof adminUsername !== 'string') {
      setMessage({ type: 'error', text: 'Admin username is invalid' });
      return;
    }

    const validEntryIds = selectedEntries.filter(id => Number.isInteger(id));
    if (validEntryIds.length === 0) {
      setMessage({ type: 'error', text: 'No valid entry IDs selected' });
      return;
    }

    setIsPosting(true);
    try {
      const response = await axios.post(`${API_URL}/reject-entries`, {
        entryIds: validEntryIds,
        rejectedBy: adminUsername,
        narration: adminComment // added
      });
      setMessage({ type: 'success', text: response.data.msg });
      setSelectedEntries([]);
      await fetchPendingEntries();
    } catch (err) {
      console.error("Error rejecting entries:", err);
      setMessage({ type: 'error', text: 'Failed to reject entries' });
    } finally {
      setIsPosting(false);
    }
  };

  const handleSelectEntry = (id: number) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntries.length === pendingEntries.length) {
      setSelectedEntries([]);
    } else {
      setSelectedEntries(pendingEntries.map(entry => entry.id));
    }
  };

  // Group pending entries by hash_val and period for header-level view
  const groupedEntries = pendingEntries.reduce((acc, entry) => {
    const key = `${entry.hash_val}-${entry.period}`;
    if (!acc[key]) {
      acc[key] = {
        hash_val: entry.hash_val,
        period: entry.period,
        narration: entry.narration,
        entry_type: entry.entry_type,
        created_at: entry.created_at,
        created_by: entry.created_by || 'system',
        total_debit: 0,
        total_credit: 0,
        line_items: []
      };
    }
    
    const amount = parseFloat(entry.amount) || 0;
    if (amount > 0) {
      acc[key].total_debit += amount;
    } else {
      acc[key].total_credit += Math.abs(amount);
    }
    
    acc[key].line_items.push({
      id: entry.id,
      glAccount: entry.glAccount,
      glName: entry.glName,
      amount: entry.amount,
      debit: amount > 0 ? amount : 0,
      credit: amount < 0 ? Math.abs(amount) : 0
    });
    
    return acc;
  }, {} as Record<string, any>);

  // CHANGED: Group view entries logic updated to include new fields
const groupedViewEntries = entryList.reduce((acc, entry) => {
    const key = `${entry.hash_val}-${entry.period}`;
    if (!acc[key]) {
      acc[key] = {
        hash_val: entry.hash_val,
        period: entry.period,
        narration: entry.narration,
        total_debit: 0,
        total_credit: 0,
        line_items: [],
        // Capture header-level details from the first entry in the group
        status: entry.status,
        created_by: entry.created_by,
        // FIX: Changed to admin_comments (plural) to match the backend
        admin_comment: entry.admin_comments,
        action_by: entry.approved_by || entry.rejected_by,
        action_at: entry.approved_at || entry.rejected_at,
      };
    }
    
    const amount = parseFloat(entry.amount) || 0;
    if (amount > 0) {
      acc[key].total_debit += amount;
    } else {
      acc[key].total_credit += Math.abs(amount);
    }
    
    acc[key].line_items.push({
      glAccount: entry.glAccount,
      glName: entry.glName,
      amount: entry.amount,
      debit: amount > 0 ? amount : 0,
      credit: amount < 0 ? Math.abs(amount) : 0
    });
    
    return acc;
  }, {} as Record<string, any>);

  const toggleHeaderExpansion = (headerKey: string) => {
    const newExpanded = new Set(expandedHeaders);
    if (newExpanded.has(headerKey)) {
      newExpanded.delete(headerKey);
    } else {
      newExpanded.add(headerKey);
    }
    setExpandedHeaders(newExpanded);
  };

  const toggleViewHeaderExpansion = (headerKey: string) => {
    const newExpanded = new Set(expandedViewHeaders);
    if (newExpanded.has(headerKey)) {
      newExpanded.delete(headerKey);
    } else {
      newExpanded.add(headerKey);
    }
    setExpandedViewHeaders(newExpanded);
  };

  const handleSelectHeader = (headerKey: string) => {
    const header = groupedEntries[headerKey];
    const lineItemIds = header.line_items.map((item: any) => item.id);
    
    const allSelected = lineItemIds.every((id: number) => selectedEntries.includes(id));
    
    if (allSelected) {
      setSelectedEntries(prev => prev.filter(id => !lineItemIds.includes(id)));
    } else {
      setSelectedEntries(prev => Array.from(new Set([...prev, ...lineItemIds])));
    }
  };

  // ADDED: Helper function to determine chip color based on status
  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };


  if (isLoading) return <div>Loading...</div>;
  if (error && !isPosting) return <div style={{ color: "red" }}>{error}</div>;

  const typeOptions: Array<"Debit" | "Credit"> = ["Debit", "Credit"];

  return (
    <Box p={3}>
      <Card elevation={3}>
        <CardContent>
          {/* ... (Existing code for header and tabs remains the same) ... */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" fontWeight="bold">
              Adjustment Journal Entries
            </Typography>
            <Box>
              {!adminLoggedIn && (
                <Button 
                  variant="outlined" 
                  onClick={() => setShowAdminLogin(true)}
                  sx={{ mr: 2 }}
                >
                  Approve MJE
                </Button>
              )}
              {adminLoggedIn && (
                <Chip 
                  label={`Admin: ${adminUsername}`} 
                  color="primary" 
                  sx={{ mr: 2 }}
                />
              )}
              <Button variant="outlined" onClick={onBack}>
                ← Back
              </Button>
            </Box>
          </Stack>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          {adminLoggedIn && (
            <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
              <Tab label={`Pending Approvals (${Object.keys(groupedEntries).length})`} />
            </Tabs>
          )}

          {adminLoggedIn && tabValue === 0 && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>Pending Entries for Approval (Header Level)</Typography>
              
              {Object.keys(groupedEntries).length > 0 && (
                <Box sx={{ mb: 2 }}>
                   <TextField
                      label="Admin Comment"
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Enter comment for approval/rejection"
                      multiline
                      rows={2}
                      sx={{ width: '100%', mb: 2 }}
                    />
                                  <Button 
                    variant="contained" 
                    color="success" 
                    onClick={handleApproveSelected}
                    disabled={selectedEntries.length === 0 || isPosting}
                    sx={{ mr: 2 }}
                  >
                    Approve Selected ({selectedEntries.length})
                  </Button>
                  <Button 
                    variant="contained" 
                    color="error" 
                    onClick={handleRejectSelected}
                    disabled={selectedEntries.length === 0 || isPosting}
                  >
                    Reject Selected ({selectedEntries.length})
                  </Button>
                </Box>
              )}

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Select</TableCell>
                      {/* <TableCell>Hash Value</TableCell> */}
                      <TableCell>Period</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Created On</TableCell>
                      <TableCell>Narration</TableCell>
                      <TableCell>Amount Credit</TableCell>
                      <TableCell>Amount Debit</TableCell>
                      <TableCell>Expand</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(groupedEntries).map(([headerKey, header]: [string, any]) => (
                      <React.Fragment key={headerKey}>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>
                            <Checkbox
                              checked={header.line_items.every((item: any) => selectedEntries.includes(item.id))}
                              indeterminate={
                                header.line_items.some((item: any) => selectedEntries.includes(item.id)) &&
                                !header.line_items.every((item: any) => selectedEntries.includes(item.id))
                              }
                              onChange={() => handleSelectHeader(headerKey)}
                            />
                          </TableCell>
                          {/* <TableCell sx={{ fontWeight: 'bold' }}>{header.hash_val}</TableCell> */}
                          <TableCell sx={{ fontWeight: 'bold' }}>{header.period}</TableCell>
                          <TableCell>{header.created_by}</TableCell>
                          <TableCell>{new Date(header.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{header.narration || "No narration provided"}</TableCell>
                          <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>
                            {header.total_credit.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ color: 'green', fontWeight: 'bold' }}>
                            {header.total_debit.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleHeaderExpansion(headerKey)}
                            >
                              {expandedHeaders.has(headerKey) ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          <TableCell colSpan={9} sx={{ p: 0 }}>
                            <Collapse in={expandedHeaders.has(headerKey)}>
                              <Box sx={{ p: 2, backgroundColor: '#fafafa' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                  Line Items:
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      {/* <TableCell>Select</TableCell> */}
                                      <TableCell>GL Account</TableCell>
                                      <TableCell>GL Name</TableCell>
                                      <TableCell>Credit Amount</TableCell>
                                      <TableCell>Debit Amount</TableCell>
                                      
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {header.line_items.map((item: any) => (
                                      <TableRow key={item.id}>
                                        {/* <TableCell>
                                          <Checkbox
                                            size="small"
                                            checked={selectedEntries.includes(item.id)}
                                            onChange={() => handleSelectEntry(item.id)}
                                          />
                                        </TableCell> */}
                                        <TableCell>{item.glAccount}</TableCell>
                                        <TableCell>{item.glName}</TableCell>
                                        <TableCell sx={{ color: item.credit > 0 ? 'red' : 'inherit' }}>
                                          {item.credit > 0 ? item.credit.toFixed(2) : '-'}
                                        </TableCell>
                                        <TableCell sx={{ color: item.debit > 0 ? 'green' : 'inherit' }}>
                                          {item.debit > 0 ? item.debit.toFixed(2) : '-'}
                                        </TableCell>
                                        
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    {Object.keys(groupedEntries).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          No pending entries
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {!adminLoggedIn && (
            <Box>
              {!showEntryControls && (
                <Button
                  variant="contained"
                  onClick={() => setShowEntryControls(true)}
                >
                  Add Journal Entry
                </Button>
              )}
              <Button
                variant="outlined"
                onClick={() => setShowEntriesDialog(true)}
                style={{ marginLeft: "10px" }}
              >
                View Entries
              </Button>
            </Box>
          )}

          {showEntryControls && (
            <Stack direction="row" spacing={2} alignItems="center" my={2}>
              <Button variant="contained" size="small" onClick={handleAddRow}>
                Add General Ledger
              </Button>
              <Autocomplete
                key={autocompleteKey}
                value={null}
                onChange={(event, newValue) => {
                  if (newValue) {
                    handleAddPeriod(newValue);
                    setAutocompleteKey((prev: number) => prev + 1);
                  }
                }}
                options={allPeriods.filter((p: string) => !selectedPeriods.includes(p))}
                getOptionLabel={(option: string) => option}
                renderInput={(params) => (
                  <TextField {...params} label="Add Period" size="small" />
                )}
                sx={{ width: 200 }}
              />
              <TextField
                value={batchNarration}
                onChange={(e) => setBatchNarration(e.target.value)}
                label="Batch Narration"
                size="small"
                sx={{ width: 300 }}
              />
            </Stack>
          )}

          {rows.length > 0 && (
            <>
              <TableContainer
                component={Paper}
                sx={{ boxShadow: 2, borderRadius: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: "bold", width: "350px" }}>
                        General Ledger Account
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold", width: "170px" }}>
                        Type
                      </TableCell>
                      {selectedPeriods.map((period: string) => (
                        <TableCell
                          key={period}
                          sx={{ fontWeight: "bold", width: "170px" }}
                        >
                          {period}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Autocomplete
                            value={
                              allGlAccounts.find(
                                (acc) => acc.glAccount === row.selectedGlAccount
                              ) || null
                            }
                            onChange={(event, newValue) => {
                              handleRowChange(row.id, {
                                selectedGlAccount: newValue?.glAccount || null,
                              });
                            }}
                            options={allGlAccounts}
                            getOptionLabel={(option) =>
                              `${option.glAccount} - ${option.glName}`
                            }
                            isOptionEqualToValue={(option, value) =>
                              option.glAccount === value.glAccount
                            }
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="GL Account"
                                size="small"
                              />
                            )}
                            sx={{ width: 320 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Autocomplete
                            value={row.transactionType}
                            onChange={(event, newValue) => {
                              if (newValue) {
                                handleRowChange(row.id, {
                                  transactionType: newValue,
                                });
                              }
                            }}
                            options={typeOptions}
                            disableClearable
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Type"
                                size="small"
                              />
                            )}
                            sx={{ width: 150 }}
                          />
                        </TableCell>
                        {selectedPeriods.map((period: string) => (
                          <TableCell key={period}>
                            <TextField
                              type="number"
                              size="small"
                              placeholder="0.00"
                              value={row.amounts[period] || ""}
                              onChange={(e) =>
                                handleAmountChange(
                                  row.id,
                                  period,
                                  e.target.value
                                )
                              }
                              disabled={!row.selectedGlAccount}
                              sx={{ width: 150 }}
                              inputProps={{ style: { textAlign: "right" } }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack direction="row" spacing={2} mt={3} alignItems="center">
                <Button
                  variant="contained"
                  onClick={handlePostEntries}
                  disabled={isPosting}
                >
                  {isPosting ? "Posting..." : "Post Entries"}
                </Button>

                {error && <Typography color="error">{error}</Typography>}
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      {showEntriesDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1300,
          }}
        >
          <Paper
            elevation={6}
            style={{
              padding: "30px",
              borderRadius: "12px",
              width: "80%", // CHANGED: Made dialog wider for more columns
              maxWidth: "1400px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Typography variant="h5" sx={{ mb: 3 }}>
              Posted Entries
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" mb={3}>
              <Autocomplete
                value={selectedEntryPeriod}
                onChange={async (event, newValue) => {
                  setSelectedEntryPeriod(newValue);
                  if (newValue) {
                    // CHANGED: API call is now conditional based on user role
                    try {
                        let url = `${API_URL}/entries?period=${newValue}`;
                        // If not admin, add user param to filter by created_by on the backend
                        if (!adminLoggedIn && currentUser) {
                            url += `&user=${currentUser}`;
                        }
                        const res = await axios.get(url);
                        setEntryList(res.data.entries || []);
                    } catch (err) {
                        console.error("Failed to fetch entries:", err);
                        setEntryList([]);
                    }
                  }
                }}
                options={entryPeriods}
                renderInput={(params) => (
                  <TextField {...params} label="Select Period" size="small" />
                )}
                sx={{ width: 400  }}
              />
            </Stack>
            {entryList.length > 0 && (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    {/* CHANGED: Added new columns */}
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Created By</TableCell>
                      <TableCell>Narration</TableCell>
                      <TableCell>Amount Credit</TableCell>
                      <TableCell>Amount Debit</TableCell>
                      <TableCell>Action By</TableCell>
                      <TableCell>Action Date</TableCell>
                      <TableCell>Admin Comment</TableCell>
                      <TableCell>Expand</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(groupedViewEntries).map(([headerKey, header]: [string, any]) => (
                      <React.Fragment key={headerKey}>
                        <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                          {/* CHANGED: Added new cells for new data */}
                          <TableCell>
                            <Chip 
                              label={header.status} 
                              color={getStatusChipColor(header.status)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{header.created_by || 'N/A'}</TableCell>
                          <TableCell>{header.narration || "No narration"}</TableCell>
                          <TableCell sx={{ color: 'red', fontWeight: 'bold' }}>
                            {header.total_credit.toFixed(2)}
                          </TableCell>
                          <TableCell sx={{ color: 'green', fontWeight: 'bold' }}>
                            {header.total_debit.toFixed(2)}
                          </TableCell>
                          <TableCell>{header.action_by || '-'}</TableCell>
                          <TableCell>
                            {header.action_at ? new Date(header.action_at).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>{header.admin_comment || '-'}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleViewHeaderExpansion(headerKey)}
                            >
                              {expandedViewHeaders.has(headerKey) ? <ExpandLess /> : <ExpandMore />}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        
                        <TableRow>
                          {/* CHANGED: Updated colSpan for new number of columns */}
                          <TableCell colSpan={9} sx={{ p: 0 }}>
                            <Collapse in={expandedViewHeaders.has(headerKey)}>
                              <Box sx={{ p: 2, backgroundColor: '#f0f8f0' }}>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                                  Line Items:
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>GL Account</TableCell>
                                      <TableCell>GL Name</TableCell>
                                      <TableCell>Credit Amount</TableCell>
                                      <TableCell>Debit Amount</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {header.line_items.map((item: any, idx: number) => (
                                      <TableRow key={idx}>
                                        <TableCell>{item.glAccount}</TableCell>
                                        <TableCell>{item.glName}</TableCell>
                                        <TableCell sx={{ color: item.credit > 0 ? 'red' : 'inherit' }}>
                                          {item.credit > 0 ? item.credit.toFixed(2) : '-'}
                                        </TableCell>
                                        <TableCell sx={{ color: item.debit > 0 ? 'green' : 'inherit' }}>
                                          {item.debit > 0 ? item.debit.toFixed(2) : '-'}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    {Object.keys(groupedViewEntries).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          No entries found for selected period
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Stack direction="row" justifyContent="flex-end" mt={3}>
              <Button
                variant="outlined"
                onClick={() => setShowEntriesDialog(false)}
              >
                Close
              </Button>
            </Stack>
          </Paper>
        </div>
      )}

      {/* {showAdminLogin && (
        <AdminLogin
          open={showAdminLogin}
          onClose={() => setShowAdminLogin(false)}
          onLogin={handleAdminLogin}
        />
      )} */}
    </Box>
  );
};

export default AdjustmentJournalPage;
