import { Country } from './country.model';

export interface Destination {
  id: number;
  name: string;
  image: string | null;
  country: Country;
}
