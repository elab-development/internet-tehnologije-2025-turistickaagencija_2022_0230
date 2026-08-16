import { Destination } from './destination.model';
import { Hotel } from './hotel.model';

export interface Arrangement {
  id: number;
  name: string;
  destination: Destination;
  hotel?: Hotel | null;
  start_date: string;
  end_date: string;
  number_of_nights: number;
  price: number | string;
  capacity: number;
  description: string;
}