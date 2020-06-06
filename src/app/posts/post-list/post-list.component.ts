import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { PageEvent } from '@angular/material/paginator';

import { PostModel } from '../post.model';

import { PostsService } from '../posts.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: PostModel[] = [];
  postsSub: Subscription;
  isLoading = false;
  pageLength = 0;
  pageSize = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  isAuth = false;
  userId: string;
  private authSub: Subscription;

  constructor(
    public postService: PostsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postService.getPosts(this.pageSize, this.currentPage);
    this.postsSub = this.postService
      .getUpdatedPosts()
      .subscribe((postData: { posts: PostModel[]; maxPosts: number }) => {
        this.isLoading = false;
        this.posts = postData.posts;
        this.pageLength = postData.maxPosts;
      });
    this.isAuth = this.authService.getIsAuth();
    this.authSub = this.authService
      .getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isAuth = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onPageChange(event: PageEvent) {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.postService.getPosts(this.pageSize, this.currentPage);
  }

  onDelete(id: string) {
    this.isLoading = true;
    this.postService.deletePost(id).subscribe(
      () => {
        this.postService.getPosts(this.pageSize, this.currentPage);
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authSub.unsubscribe();
  }
}
