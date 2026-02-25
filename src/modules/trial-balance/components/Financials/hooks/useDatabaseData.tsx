import { useState } from "react";
import { FinancialVarRow, MappedRow, TextVarRow } from "../types";

export const useDatabaseData = () => {
  const [databaseData, setDatabaseData] = useState<MappedRow[]>([]);
  const [financialVarData, setFinancialVarData] = useState<FinancialVarRow[]>([]);
  const [textVarData, setTextVarData] = useState<TextVarRow[]>([]);
  const [dbLoading, setDbLoading] = useState(false);
  const [dbError, setDbError] = useState<string>("");
   const [dbEditedNoteKeys, setDbEditedNoteKeys] = useState<Set<string>>(new Set());
  const [selectedPeriods, setSelectedPeriods] = useState<{ period1: string; period2: string } | null>(null);

  const fetchDatabaseData = async (period1: string, period2: string) => {
    try {
      setDbLoading(true);
      setDbError("");

      // Fetch trial balance
      const response = await fetch(
        `http://localhost:5000/api/trial-balance/data?period1=${encodeURIComponent(period1)}&period2=${encodeURIComponent(period2)}`
      );
      if (!response.ok) throw new Error("Failed to fetch trial balance data");
      const trialBalanceData = await response.json();

      const transformedData: MappedRow[] = trialBalanceData.map((row: any) => ({
        glAccount: row.glAccount,
        glName: row.glName,
        accountType: row.accountType,
        "Level 1 Desc": row["Level 1 Desc"],
        "Level 2 Desc": row["Level 2 Desc"],
        functionalArea: row.functionalArea,
        amountCurrent: parseFloat(row.amountCurrent) || 0,
        amountPrevious: parseFloat(row.amountPrevious) || 0,
      }));
      setDatabaseData(transformedData);

      // Fetch financial vars
      const fvResponse = await fetch("http://localhost:5000/api/financial-variables1");
      if (!fvResponse.ok) throw new Error("Failed to fetch financial variables");
      const fvData = await fvResponse.json();

      const transformedFV: FinancialVarRow[] =
        fvData.length > 0
          ? fvData.map((item: any) => ({
              key: item.key,
              amountCurrent: parseFloat(item[period1]) || 0,
              amountPrevious: parseFloat(item[period2]) || 0,
            }))
          : [];
      setFinancialVarData(transformedFV);

      // Fetch text vars
      const tvResponse = await fetch("http://localhost:5000/api/text_keys1");
      if (!tvResponse.ok) throw new Error("Failed to fetch text variables");
      const tvData = await tvResponse.json();
      setTextVarData(tvData);

      setSelectedPeriods({ period1, period2 });
      const periodKey = `${period1}_vs_${period2}`;
      const statusRes = await fetch(`http://localhost:5000/api/notes/status?periodKey=${periodKey}`);
      
      if (!statusRes.ok) {
          console.warn("Could not fetch note edit statuses, but continuing.");
      }

      const statusData = await statusRes.json();
      const initialEditedKeys = new Set<string>(statusData.editedNotes || []);
      
      console.log("Loaded previously edited note keys from DB:", initialEditedKeys);
      setDbEditedNoteKeys(initialEditedKeys);
    } catch (error) {
      console.error("Error fetching database data:", error);
      setDbError("Failed to load data from database");
    } finally {
      setDbLoading(false);
    }
  };

  return { databaseData, financialVarData, textVarData, dbLoading, dbError, selectedPeriods, fetchDatabaseData,dbEditedNoteKeys, };
};
