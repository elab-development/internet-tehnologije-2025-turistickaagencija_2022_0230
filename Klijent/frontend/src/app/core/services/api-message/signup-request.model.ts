export interface SignupRequest {
  profileName: string;
  email: string;
  password: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
}
