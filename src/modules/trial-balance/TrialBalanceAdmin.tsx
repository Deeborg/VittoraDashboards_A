import React, { useState } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Header from "./components/MainPage/Header";
import ActionButtons from "./components/MainPage/ActionButtons";
import ConfirmResetDialog from "./components/MainPage/ConfirmResetDialog";
import UploadSection from "./components/MainPage/UploadSection";
import ColumnMapperSection from "./components/MainPage/ColumnMapperSection";
import MappingSuccess from "./components/MainPage/MappingSuccess";
import FinancialStatementsSection from ".//components/MainPage/FinancialStatementsSection";
import AdjustmentJournalPage from "./Pages/AdjustmentJournalPage";
import { MappedRow } from "./components/MainPage/Types/types";

const TrialBalanceAdmin: React.FC = () => {
  const [excelData, setExcelData] = useState<any[]>([]);
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<"main" | "adjustment">("main");
  const [amountKeys, setAmountKeys] = useState({
    amountCurrentKey: "",
    amountPreviousKey: "",
  });
  const [useDatabase, setUseDatabase] = useState(false);

  const columns = excelData.length > 0 ? Object.keys(excelData[0]) : [];

  const handleConfirm = (
    mappedData: MappedRow[],
    amountCurrentKey: string,
    amountPreviousKey: string
  ) => {
    setMappedData(mappedData);
    setAmountKeys({ amountCurrentKey, amountPreviousKey });
  };

  const appTheme = createTheme({
    palette: { mode: darkMode ? "dark" : "light" },
  });
  const handleReset = () => {
  setExcelData([]);
  setMappedData([]);
  setUseDatabase(false);
  setConfirmOpen(false);
  // Instead of reload, just clear the data
};

  return (
    // <ThemeProvider theme={appTheme}>
    //   <CssBaseline />
      
        <Box
          sx={{
            minHeight: "100vh",
            px: { xs: 2, md: 6 },
            py: 4,
            maxWidth: "1800px",
            margin: "0 auto",
          }}
        >
        {currentPage === "main" ? (
            <>
          <Header darkMode={darkMode} />
          <ActionButtons
            useDatabase={useDatabase}
            setUseDatabase={setUseDatabase}
            onGoToAdjustments={() => setCurrentPage("adjustment")}
            onResetClick={() => setConfirmOpen(true)}
          />
          
          <ConfirmResetDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={handleReset}
          />

          {!useDatabase && <UploadSection onDataParsed={setExcelData} />}
          {!useDatabase && excelData.length > 0 && mappedData.length === 0 && (
            <ColumnMapperSection
              columns={columns}
              rawData={excelData}
              onConfirm={handleConfirm}
            />
          )}
          {!useDatabase && mappedData.length > 0 && <MappingSuccess />}
          {(useDatabase || mappedData.length > 0) && (
            <FinancialStatementsSection
              data={mappedData}
              amountKeys={amountKeys}
              useDatabase={useDatabase}
            />
          )}
        </>
      ) : (
        <AdjustmentJournalPage onBack={() => setCurrentPage("main")} />
      )}
      </Box>
  );
};

export default TrialBalanceAdmin;
