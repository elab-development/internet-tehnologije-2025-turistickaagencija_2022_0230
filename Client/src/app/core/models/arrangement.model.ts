import { Destination } from "./destination.model";
import { Hotel } from "./hotel.model";

export interface Arrangement {
  id: number;
  naziv: string;
  destinacija: Destination;
  hotel?: Hotel | null;
  datum_pocetka: Date;
  datum_zavrsetka: Date;
  broj_nocenja: number;
  cena: number; 
  broj_mesta: number;
  opis: string;
}