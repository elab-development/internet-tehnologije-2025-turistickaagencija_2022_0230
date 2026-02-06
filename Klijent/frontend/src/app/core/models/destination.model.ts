import { Country } from "./country.model";

export interface Destination {
  id: number;
  naziv: string;
  slika: string;
  drzava: Country;
}
