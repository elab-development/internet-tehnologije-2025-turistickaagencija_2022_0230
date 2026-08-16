import { Destination } from '../../models/destination.model';

export interface TopDestResponse {
  destination: Destination;
  arrangement_count: number;
}