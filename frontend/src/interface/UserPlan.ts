export interface UserPlan {
  id: string;
  in_use: number;
  purchased_at: string;
  expires_at: string;
  name: string;
  vCPU: number;
  storage: number;
  backups: number;
  memory: number;
}