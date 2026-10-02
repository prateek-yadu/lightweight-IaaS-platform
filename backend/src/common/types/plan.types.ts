export interface Plan {
  id: string;
  razorpay_id: string;
  specs: PlanSpecs;
  type: PlanType;
  validity_days: number;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface PlanSpecs {
  vCPU: number;
  memory: string;
  storage: string;
  dataTransfer: string;
}

export type PlanType = "shared" | "dedicated"