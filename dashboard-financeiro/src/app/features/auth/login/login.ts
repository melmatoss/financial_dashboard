import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private fb = new FormBuilder();
  private authService = inject(AuthService);
  private router = inject(Router);

  mode = signal<'login' | 'signup'>('login');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  toggleMode(): void {
    this.mode.set(this.mode() === 'login' ? 'signup' : 'login');
    this.errorMessage.set(null);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();

    const result = this.mode() === 'login'
      ? await this.authService.signIn(email, password)
      : await this.authService.signUp(email, password);

    this.loading.set(false);

    if (result.error) {
      this.errorMessage.set(result.error);
      return;
    }

    if (this.mode() === 'signup') {
      this.errorMessage.set('Conta criada! Confere seu e-mail para confirmar o cadastro.');
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}