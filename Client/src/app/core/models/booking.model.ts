import { User } from './user.model';
import { Arrangement } from './arrangement.model';

export interface Booking {
  id: number;
  user: User;
  aranzman: Arrangement;
  guests: number;
  total_price: number;
  status: string;
  payment_status: string;
  booked_at: string;
}
