import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface BasicUser { _id: string; username: string; email?: string; role?: string }

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = 'http://localhost:5000/api/users';
  constructor(private readonly http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  me(): Observable<BasicUser> {
    return this.http.get<BasicUser>(`${this.baseUrl}/me`, { headers: this.authHeaders() });
  }

  getById(id: string): Observable<BasicUser> {
    return this.http.get<BasicUser>(`${this.baseUrl}/${id}`);
  }

  search(q: string): Observable<BasicUser[]> {
    return this.http.get<BasicUser[]>(`${this.baseUrl}/search`, { params: { q } });
  }

  follow(userId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/follow/${userId}`, {}, { headers: this.authHeaders() });
  }

  unfollow(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/follow/${userId}`, { headers: this.authHeaders() });
  }

  followStatus(userId: string): Observable<{ following: boolean }> {
    return this.http.get<{ following: boolean }>(`${this.baseUrl}/follow/status/${userId}`, { headers: this.authHeaders() });
  }

  getFollowersCount(userId: string): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.baseUrl}/${userId}/followers/count`);
  }

  getFollowingCount(userId: string): Observable<{count: number}> {
    return this.http.get<{count: number}>(`${this.baseUrl}/${userId}/following/count`);
  }
}


