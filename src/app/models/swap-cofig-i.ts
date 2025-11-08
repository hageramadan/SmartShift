export interface SwapCofigI {
     id: number  | null;
  department: string;
  swapsEnabled: boolean;
  requiresApproval: boolean;
  minAdvanceNotice: number;
  maxSwapsPerMonth: number;
}
