import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { User, AuthCredentials } from "@/domain/entities/user.entity";
import { AuthError, AuthErrorCodes } from "@/domain/entities/error.entity";

export class FirebaseAuthService {
  private handleFirebaseError(error: any): never {
    if (error.code) {
      switch (error.code) {
        case "auth/network-request-failed":
          throw new AuthError("Network error occurred. Please check your connection.", AuthErrorCodes.NETWORK_ERROR);
        case "auth/too-many-requests":
          throw new AuthError("Too many attempts. Please try again later.", AuthErrorCodes.FIREBASE_ERROR);
        case "auth/user-token-expired":
          throw new AuthError("Your session has expired. Please login again.", AuthErrorCodes.TOKEN_ERROR);
        default:
          throw new AuthError(error.message || "Firebase authentication error", AuthErrorCodes.FIREBASE_ERROR);
      }
    }
    throw new AuthError("An unexpected error occurred", AuthErrorCodes.UNKNOWN_ERROR);
  }

  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName || undefined,
      photoURL: firebaseUser.photoURL || undefined,
    };
  }

  async signInWithEmailAndPassword(email: string, password: string): Promise<{ user: User; idToken: string }> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      return {
        user: this.mapFirebaseUser(userCredential.user),
        idToken,
      };
    } catch (error: any) {
      this.handleFirebaseError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(auth);
    } catch (error: any) {
      this.handleFirebaseError(error);
    }
  }

  getCurrentUser(): User | null {
    const firebaseUser = auth.currentUser;
    return firebaseUser ? this.mapFirebaseUser(firebaseUser) : null;
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return firebaseOnAuthStateChanged(auth, (firebaseUser) => {
      callback(firebaseUser ? this.mapFirebaseUser(firebaseUser) : null);
    });
  }
}
