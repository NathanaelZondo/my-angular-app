import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private authService = inject(AuthService);
  
  protected currentUserSignal = signal<any>(null);
  protected isAuthenticated = signal<boolean>(false);

  constructor() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUserSignal.set(user);
      this.isAuthenticated.set(!!user);
    });
  }

  onLogout() {
    this.authService.logOut();
  }
}
