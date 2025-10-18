import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class Auth {
  private baseUrl = 'http://localhost:5000/api/auth';
  private currentUser: { id: string; username: string; role?: string } | null = null;

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        if (res.user) {
          this.currentUser = res.user;
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  register(data: { username: string; email: string; password: string; role: string }) {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUser() {
    if (!this.currentUser) {
      const raw = localStorage.getItem('user');
      this.currentUser = raw ? JSON.parse(raw) : null;
    }
    return this.currentUser;
  }
}
