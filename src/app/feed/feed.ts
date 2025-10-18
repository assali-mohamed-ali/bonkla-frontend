import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { PostService, Post } from '../services/post.service';
import { LikeService } from '../services/like.service';
import { CommentService, Comment } from '../services/comment.service';
import { Auth } from '../services/auth';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feed',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './feed.html',
  styleUrl: './feed.css'
})
export class Feed implements OnInit {
  posts: Post[] = [];
  currentIndex: number = 0;
  likedPosts: Set<string> = new Set();
  isLoggedIn: boolean = false;
  comments: Comment[] = [];
  showComments: boolean = false;
  newComment: string = '';
  isAddingComment: boolean = false;

  constructor(
    private readonly postService: PostService, 
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
    private readonly auth: Auth,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.auth.isLoggedIn();
    this.loadPosts();
  }

  loadPosts() {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        if (this.isLoggedIn) {
          this.loadLikeStatuses();
        }
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading posts:', err)
    });
  }

  loadLikeStatuses() {
    for (const post of this.posts) {
      this.likeService.getLikeStatus(post._id).subscribe({
        next: (status) => {
          if (status.liked) {
            this.likedPosts.add(post._id);
          }
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error loading like status:', err)
      });
    }
  }

  nextVideo() {
    if (this.currentIndex < this.posts.length - 1) {
      this.currentIndex++;
    }
  }

  prevVideo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  toggleLike(postId: string) {
    if (!this.isLoggedIn) {
      console.log('User must be logged in to like posts');
      return;
    }

    const isLiked = this.likedPosts.has(postId);
    const post = this.posts.find(p => p._id === postId);
    
    if (!post) return;

    if (isLiked) {
      this.likeService.unlikePost(postId).subscribe({
        next: () => {
          this.likedPosts.delete(postId);
          post.likesCount = Math.max(0, post.likesCount - 1);
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error unliking post:', err)
      });
    } else {
      this.likeService.likePost(postId).subscribe({
        next: () => {
          this.likedPosts.add(postId);
          post.likesCount++;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error liking post:', err)
      });
    }
  }

  isLiked(postId: string): boolean {
    return this.likedPosts.has(postId);
  }

  toggleComments() {
    this.showComments = !this.showComments;
    if (this.showComments && this.posts.length > 0) {
      this.loadComments(this.posts[this.currentIndex]._id);
    }
  }

  loadComments(postId: string) {
    this.commentService.getComments(postId).subscribe({
      next: (response) => {
        this.comments = response.comments;
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.isLoggedIn || this.posts.length === 0 || this.isAddingComment) {
      console.log('Cannot add comment:', {
        hasText: !!this.newComment.trim(),
        isLoggedIn: this.isLoggedIn,
        hasPosts: this.posts.length > 0,
        isAdding: this.isAddingComment
      });
      return;
    }

    const postId = this.posts[this.currentIndex]._id;
    const commentText = this.newComment.trim();
    
    console.log('Adding comment:', { postId, text: commentText });
    
    this.isAddingComment = true;
    this.cdr.markForCheck();
    
    this.commentService.createComment(postId, commentText).subscribe({
      next: (response) => {
        console.log('Comment added successfully:', response);
        this.comments.unshift(response.comment);
        this.posts[this.currentIndex].commentsCount++;
        this.newComment = '';
        this.isAddingComment = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.isAddingComment = false;
        this.cdr.markForCheck();
        alert('Erreur lors de l\'ajout du commentaire: ' + (err.error?.error || err.message));
      }
    });
  }

  deleteComment(commentId: string) {
    if (!this.isLoggedIn) return;

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c._id !== commentId);
        this.posts[this.currentIndex].commentsCount = Math.max(0, this.posts[this.currentIndex].commentsCount - 1);
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error deleting comment:', err)
    });
  }

  canDeleteComment(comment: Comment): boolean {
    if (!this.isLoggedIn) return false;
    const currentUser = this.auth.getUser();
    return currentUser?.id === comment.userId._id;
  }

  deletePost(postId: string) {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(postId).subscribe({
        next: () => {
          this.loadPosts(); // Reload posts
          if (this.currentIndex >= this.posts.length) {
            this.currentIndex = Math.max(0, this.posts.length - 1);
          }
        },
        error: (err) => console.error('Error deleting post:', err)
      });
    }
  }
}
