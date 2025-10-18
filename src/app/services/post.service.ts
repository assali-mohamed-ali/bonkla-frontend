import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Post {
  _id: string;
  userId: {
    _id: string;
    username: string;
  };
  mediaType: 'image' | 'video';
  mediaUrl: string;
  description: string;
  likesCount: number;
  commentsCount: number;
  shares: number;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly baseUrl = 'http://localhost:5000/api/posts';

  constructor(private readonly http: HttpClient) {}

  private authHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl);
  }

  createPost(formData: FormData): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, formData, { headers: this.authHeaders() });
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { headers: this.authHeaders() });
  }
}
