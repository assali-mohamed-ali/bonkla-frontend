import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Comment {
  _id: string;
  postId: string;
  userId: {
    _id: string;
    username: string;
  };
  text: string;
  createdAt: string;
}

export interface CommentResponse {
  comments: Comment[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface CommentCount {
  count: number;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private readonly baseUrl = 'http://localhost:5000/api/comments';

  constructor(private readonly http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // Create a comment
  createComment(postId: string, text: string): Observable<{ message: string; comment: Comment }> {
    console.log('CommentService: Creating comment', { postId, text, baseUrl: this.baseUrl });
    return this.http.post<{ message: string; comment: Comment }>(
      this.baseUrl,
      { postId, text },
      { headers: this.authHeaders() }
    );
  }

  // Get comments for a post
  getComments(postId: string, page: number = 1, limit: number = 20): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(
      `${this.baseUrl}/${postId}?page=${page}&limit=${limit}`
    );
  }

  // Delete a comment
  deleteComment(commentId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${commentId}`,
      { headers: this.authHeaders() }
    );
  }

  // Get comment count for a post
  getCommentCount(postId: string): Observable<CommentCount> {
    return this.http.get<CommentCount>(`${this.baseUrl}/${postId}/count`);
  }

  // Get all comments by a user
  getUserComments(userId: string, page: number = 1, limit: number = 20): Observable<CommentResponse> {
    return this.http.get<CommentResponse>(
      `${this.baseUrl}/user/${userId}?page=${page}&limit=${limit}`,
      { headers: this.authHeaders() }
    );
  }
}
