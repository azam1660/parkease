export interface Payment {
  id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  method: string;
  vehicleId: string;
  createdAt: string;
}
