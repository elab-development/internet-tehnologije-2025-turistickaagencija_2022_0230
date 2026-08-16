import { Destination } from './destination.model';

export interface Hotel {
  id: number;
  name: string;
  image: string | null;
  rating: number | string;
  price_per_night: number | string;
  destination: Destination;
}