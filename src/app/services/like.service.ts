import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Like {
  _id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface LikeStatus {
  liked: boolean;
}

export interface LikeCount {
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  private readonly baseUrl = 'http://localhost:5000/api/likes';

  constructor(private readonly http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // Like a post
  likePost(postId: string): Observable<{ message: string; like: Like }> {
    return this.http.post<{ message: string; like: Like }>(
      this.baseUrl,
      { postId },
      { headers: this.authHeaders() }
    );
  }

  // Unlike a post
  unlikePost(postId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${postId}`,
      { headers: this.authHeaders() }
    );
  }

  // Get like status for a post
  getLikeStatus(postId: string): Observable<LikeStatus> {
    return this.http.get<LikeStatus>(
      `${this.baseUrl}/${postId}/status`,
      { headers: this.authHeaders() }
    );
  }

  // Get like count for a post
  getLikeCount(postId: string): Observable<LikeCount> {
    return this.http.get<LikeCount>(`${this.baseUrl}/${postId}/count`);
  }

  // Get all likes by a user
  getUserLikes(userId: string): Observable<Like[]> {
    return this.http.get<Like[]>(
      `${this.baseUrl}/user/${userId}`,
      { headers: this.authHeaders() }
    );
  }
}
