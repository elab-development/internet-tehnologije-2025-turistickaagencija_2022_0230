import { User } from "../../models/user.model";


export interface LoginResponse {
  user: User;
  token: string;
}