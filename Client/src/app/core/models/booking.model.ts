import { User } from './user.model';
import { Arrangement } from './arrangement.model';

export interface Booking {
  id: number;
  user: User;
  arrangement: Arrangement;
  guests: number;
  adults: number;
  children: number;
  unit_price: number;
  total_price: number;
  status: string;
  payment_status: string;
  booked_at: string;
  cancelled_at: string | null;
  notes: string;
}
