import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm: FormGroup;
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    try {
      await this.authService.logIn(this.loginForm.value.email, this.loginForm.value.password);
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error = 'Failed to log in. Please check your credentials.';
      console.error(err);
    }
  }

  async onGoogleSignIn() {
    try {
      await this.authService.googleSignIn();
      this.router.navigate(['/dashboard']);
    } catch (err) {
      this.error = 'Failed to sign in with Google. Please try again.';
      console.error(err);
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
