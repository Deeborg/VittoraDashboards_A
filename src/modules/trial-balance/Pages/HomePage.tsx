import React from "react";
import TrialBalanceAdmin from "../TrialBalanceAdmin";

const HomePage: React.FC = () => {
  // Directly load Trial Balance without login
  return <TrialBalanceAdmin />;
};

export default HomePage;