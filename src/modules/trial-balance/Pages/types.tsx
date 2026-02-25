export interface JournalRow {
  id: string;
  selectedGlAccount: string | null;
  transactionType: "Debit" | "Credit";
  amounts: { [period: string]: number | "" };
}

export interface GLAccountInfo {
  glAccount: string;
  glName: string;
}