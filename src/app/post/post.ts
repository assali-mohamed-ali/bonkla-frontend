import { Component } from '@angular/core';
import { PostService } from '../services/post.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  imports: [FormsModule, CommonModule],
  templateUrl: './post.html',
  styleUrl: './post.css'
})
export class Post {
  description = '';
  selectedFile: File | null = null;

  constructor(private readonly postService: PostService, private readonly router: Router) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  submit() {
    if (!this.selectedFile) {
      alert('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('media', this.selectedFile);
    formData.append('description', this.description);

    this.postService.createPost(formData).subscribe({
      next: () => {
        alert('Post created successfully!');
        this.router.navigate(['/feed']);
      },
      error: (err) => {
        console.error('Error creating post:', err);
        alert('Error creating post');
      }
    });
  }
}
