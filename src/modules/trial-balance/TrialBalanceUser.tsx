import React, { useState } from "react";
import { Box, CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Header from "./components/MainPage/Header";
import ActionButtonsUser from "./components/MainPage/ActionButtonsUser";
import ConfirmResetDialog from "./components/MainPage/ConfirmResetDialog";
import FinancialStatementsSection from "./components/MainPage/FinancialStatementsSection";
import AdjustmentJournalPage from "./Pages/AdjustmentJournalPage";
import { MappedRow } from "./components/MainPage/Types/types";

const TrialBalanceUser: React.FC = () => {
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState<"main" | "adjustment">("main");
  const [amountKeys, setAmountKeys] = useState({
    amountCurrentKey: "",
    amountPreviousKey: "",
  });

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
          <ActionButtonsUser
            onGoToAdjustments={() => setCurrentPage("adjustment")}
            onResetClick={() => setConfirmOpen(true)}
          />
          <ConfirmResetDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            onConfirm={() => window.location.reload()}
          />

          {/* Directly load from database */}
          <FinancialStatementsSection
            data={mappedData}
            amountKeys={amountKeys}
            useDatabase={true}
          />
         </>
      ) : (
        <AdjustmentJournalPage onBack={() => setCurrentPage("main")}  />
      )}
      </Box>
  );
};

export default TrialBalanceUser;
