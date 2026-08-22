export interface Transport {
  id: number;
  company_name: string;
  transport_type: 'BUS' | 'PLANE' | 'TRAIN' | 'BOAT' | 'OTHER';
  vehicle_name: string;
  departure_location: string;
  arrival_location: string;
  description: string;
  is_active: boolean;
}