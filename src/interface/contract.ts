export interface IContract {
  id: string;
  operator: string;
  contractorName: string;
  contractTitle: string;
  year: string;
  contractNumber: string;
  startDate: string;  // Format: YYYY-MM-DD
  endDate: string;    // Format: YYYY-MM-DD
  contractValue: number;  // In USD or relevant currency
  status: "active" | "completed" | "pending" | "cancelled";
};