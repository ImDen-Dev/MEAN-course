import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import { PostModel } from './post.model';

import { environment } from '../../environments/environment';

const BACKEND_URL = environment.apiUrl + '/posts/';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: PostModel[] = [];
  private postsUpdate = new Subject<{ posts: PostModel[]; maxPosts: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(pageSize: number, currentPage: number) {
    // return [...this.posts];
    const queryParam = `?pagesize=${pageSize}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPost: number }>(
        BACKEND_URL + queryParam
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator
              };
            }),
            maxPosts: postData.maxPost
          };
        })
      )
      .subscribe(transformedPosts => {
        this.posts = transformedPosts.posts;
        this.postsUpdate.next({
          posts: [...this.posts],
          maxPosts: transformedPosts.maxPosts
        });
      });
  }

  getPost(id: string) {
    // return { ...this.posts.find(p => p.id === id) };
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
    }>(BACKEND_URL + id);
  }

  getUpdatedPosts() {
    return this.postsUpdate.asObservable();
  }

  addPosts(title: string, content: string, image: File) {
    // const post = { title, content, id: null };
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string; post: PostModel }>(BACKEND_URL, postData)
      .subscribe(responseData => {
        // const post: PostModel = {
        //   id: responseData.post.id,
        //   title,
        //   content,
        //   imagePath: responseData.post.imagePath
        // };
        // this.posts.push(post); // this.posts.push({title: title, content: content});
        // this.postsUpdate.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    // const post: PostModel = { id, title, content, imagePath: null };
    let postData: PostModel | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id,
        title,
        content,
        imagePath: image,
        creator: null
      };
    }
    this.http.put(BACKEND_URL + id, postData).subscribe(resp => {
      // const updatedPosts = [...this.posts];
      // const oldPostIndex = updatedPosts.findIndex(p => p.id === id);
      // updatedPosts[oldPostIndex] = {
      //   id,
      //   title,
      //   content,
      //   imagePath: ''
      // };
      // this.posts = updatedPosts;
      // this.postsUpdate.next([...this.posts]);
      this.router.navigate(['/']);
    });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
    // .subscribe(() => {
    //   this.posts = this.posts.filter(posts => posts.id !== postId);
    //   this.postsUpdate.next([...this.posts]);
    // });
  }
}
