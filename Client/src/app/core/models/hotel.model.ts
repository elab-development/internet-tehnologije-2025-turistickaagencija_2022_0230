import { Destination } from "./destination.model";

export interface Hotel {
  id: number;
  naziv: string;
  slika: string;
  ocena: number;    
  cena_nocenja: number;
  destinacija:Destination;
}