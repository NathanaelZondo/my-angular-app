import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  getAuth,
} from '@angular/fire/auth';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth: Auth;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor() {
    this.auth = inject(Auth);
    
    onAuthStateChanged(this.auth, (user) => {
      this.currentUserSubject.next(user);
    });
  }

  signUp(email: string, password: string): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, email, password).then(() => {});
  }

  logIn(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password).then(() => {});
  }

  googleSignIn(): Promise<void> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider).then(() => {});
  }

  logOut(): Promise<void> {
    return signOut(this.auth);
  }

  get currentUser() {
    return this.currentUserSubject.value;
  }
}
