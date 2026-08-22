import { Destination } from './destination.model';
import { Hotel } from './hotel.model';
import { Transport } from './transport.model';

export interface Arrangement {
  id: number;
  name: string;
  destination: Destination;
  hotel?: Hotel | null;
  transport?: Transport | null;
  start_date: string;
  end_date: string;
  number_of_nights: number;
  price: number | string;
  price_per_child: number | string | null;
  capacity: number;
  description: string;
  included_services: string;
  excluded_services: string;
  meeting_point: string;
  status: string;
  is_active: boolean;
}