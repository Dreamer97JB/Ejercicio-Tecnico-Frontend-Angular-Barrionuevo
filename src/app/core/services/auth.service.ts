import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface LoginResponse {
  accessToken: string;
  role: 'admin' | 'user';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = 'http://localhost:3002/bp/auth';

  constructor(private http: HttpClient) { }

  login(username: string, password: string) {
    return this.http.post<LoginResponse>(`${this.api}/login`, {
      username,
      password,
    });
  }

  setToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  logout() {
    localStorage.removeItem('access_token');
  }
}
