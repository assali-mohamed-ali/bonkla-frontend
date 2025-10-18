import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../services/auth';
import { PostService, Post } from '../services/post.service';
import { UserService } from '../services/user.service';
import { LikeService } from '../services/like.service';
import { CommentService, Comment } from '../services/comment.service';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  user: { id: string; username: string; role?: string } | null = null;
  posts: Post[] = [];
  viewingUser: { _id: string; username: string } | null = null;
  following = false;
  followersCount = 0;
  followingCount = 0;
  likedPosts: Set<string> = new Set();
  isLoggedIn: boolean = false;
  comments: Comment[] = [];
  showComments: boolean = false;
  newComment: string = '';
  selectedPostId: string = '';
  isAddingComment: boolean = false;

  constructor(
    private readonly auth: Auth,
    private readonly postService: PostService,
    private readonly users: UserService,
    private readonly likeService: LikeService,
    private readonly commentService: CommentService,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.user = this.auth.getUser();
    this.isLoggedIn = this.auth.isLoggedIn();
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.loadOtherUser(id);
    } else {
      this.load();
    }
  }

  load() {
    this.postService.getPosts().subscribe({
      next: (all) => {
        const uid = this.user?.id;
        this.posts = uid ? all.filter(p => p.userId?._id === uid) : [];
        if (this.isLoggedIn) {
          this.loadLikeStatuses();
        }
        this.cdr.markForCheck();
      },
      error: (err) => console.error('Error loading user posts:', err)
    });
  }

  loadOtherUser(id: string) {
    this.users.getById(id).subscribe({
      next: (u) => {
        this.viewingUser = u;
        this.loadFollowCounts(id);
        this.users.followStatus(id).subscribe({
          next: s => { this.following = s.following; this.cdr.markForCheck(); },
          error: () => {}
        });
        this.postService.getPosts().subscribe({
          next: (all) => {
            this.posts = all.filter(p => p.userId?._id === id);
            if (this.isLoggedIn) {
              this.loadLikeStatuses();
            }
            this.cdr.markForCheck();
          },
          error: (err) => console.error('Error loading posts by user:', err)
        });
      },
      error: (e) => console.error('User not found', e)
    });
  }

  loadFollowCounts(userId: string) {
    this.users.getFollowersCount(userId).subscribe({
      next: (res) => {
        this.followersCount = res.count;
        this.cdr.markForCheck();
      },
      error: (e) => console.error('Error loading followers count', e)
    });

    this.users.getFollowingCount(userId).subscribe({
      next: (res) => {
        this.followingCount = res.count;
        this.cdr.markForCheck();
      },
      error: (e) => console.error('Error loading following count', e)
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

  toggleComments(postId: string) {
    this.selectedPostId = postId;
    this.showComments = !this.showComments;
    if (this.showComments) {
      this.loadComments(postId);
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
    if (!this.newComment.trim() || !this.isLoggedIn || !this.selectedPostId || this.isAddingComment) {
      console.log('Cannot add comment:', {
        hasText: !!this.newComment.trim(),
        isLoggedIn: this.isLoggedIn,
        hasSelectedPost: !!this.selectedPostId,
        isAdding: this.isAddingComment
      });
      return;
    }

    const commentText = this.newComment.trim();
    
    console.log('Adding comment:', { postId: this.selectedPostId, text: commentText });
    
    this.isAddingComment = true;
    this.cdr.markForCheck();
    
    this.commentService.createComment(this.selectedPostId, commentText).subscribe({
      next: (response) => {
        console.log('Comment added successfully:', response);
        this.comments.unshift(response.comment);
        const post = this.posts.find(p => p._id === this.selectedPostId);
        if (post) {
          post.commentsCount++;
        }
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
        const post = this.posts.find(p => p._id === this.selectedPostId);
        if (post) {
          post.commentsCount = Math.max(0, post.commentsCount - 1);
        }
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

  toggleFollow() {
    if (!this.viewingUser) return;
    const id = this.viewingUser._id;
    const op = this.following ? this.users.unfollow(id) : this.users.follow(id);
    op.subscribe({
      next: () => { this.following = !this.following; this.cdr.markForCheck(); },
      error: (e) => console.error('Follow toggle failed', e)
    });
  }
}
