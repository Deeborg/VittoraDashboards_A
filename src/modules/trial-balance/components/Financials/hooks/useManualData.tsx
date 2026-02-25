import { useEffect, useState } from "react";
import { FinancialVarRow, ManualJE, TextVarRow } from "../types";
export const useManualData = () => {
  const [manualJE, setManualJE] = useState<ManualJE[]>([]);
  const [financialVar, setFinancialVar] = useState<FinancialVarRow[]>([]);
  const [textVar, setTextVar] = useState<TextVarRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJEs = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/journal/updated");
        const data = await response.json();
        setManualJE(data);

        const response1 = await fetch("http://localhost:5000/api/financial-variables1");
        setFinancialVar(await response1.json());

        const response2 = await fetch("http://localhost:5000/api/text_keys1");
        setTextVar(await response2.json());
      } catch (error) {
        console.error("Error fetching journal entry/vars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJEs();
  }, []);

  return { manualJE, financialVar, textVar, loading };
};
