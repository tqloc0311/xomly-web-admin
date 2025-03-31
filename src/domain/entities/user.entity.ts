export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  disabled?: boolean;
  displayName?: string;
  photoURL?: string;
}
