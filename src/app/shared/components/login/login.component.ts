import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup;
  error = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }
  

  login(): void {
    if (this.form.invalid) return;

    this.isLoading = true;
    this.error = '';

    const { username, password } = this.form.value;

    this.auth.login(username!, password!).subscribe({
      next: (res) => {
        const { accessToken, role } = res;
        this.auth.setToken(accessToken);
        localStorage.setItem('user_role', role);
        this.router.navigateByUrl('/products');
      },
      error: () => {
        this.error = 'Usuario o contraseña incorrectos';
        this.isLoading = false;
      },
    });
  }
}
