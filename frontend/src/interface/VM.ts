export interface VM {
  id: string;
  name: string;
  description?: string;
  status: string;
  image: string;
  ip: string;
  region_name: string;
  region_code: string;
  expires_at: string;
  plan: string;
  vCPU: number;
  memory: number;
  storage: number;
  backups: number;
}