
export interface PostResponse {
    id: string,
    url_bucket: string,
    title: string,
    height: number,
    width: number,
    version: number,
    content: string,
    user: {
        name: string,
        id: number,
    },
    _count: {
        comments: number,
    }
}

// Base Comment interface
export interface Comment {
  id: string;
  id_user: string;
  id_post: string;
  content: string;
  created_at?: string;
  // Add other comment fields based on your database schema
}
export interface Post {
  id: string;
  id_user: string;
  url_bucket: string;
  version: number;
  height: number;
  width: number;
  title?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  // Add other post fields based on your database schema
}

export interface CreatePostRequest {
  title?: string;
  content?: string;
  // Add other fields that can be sent in post body
}

export interface CreatePostResponse extends Post {
  // This returns the created post object directly based on your router
}
// GET /comments/:id - Get single comment
export interface GetCommentByIdResponse extends Comment {
  // This returns the comment object directly based on your router
}
export interface GetCommentsByPostResponse {
  comments: Comment[];
}



export interface CommentRequest {
    postId: string,
    content: string,
}
export interface RegisterUserRequest {
    name: string,
    email: string,
    password: string
};
export interface LoginUserRequest {
    email: string,
    password: string
}

export interface LoginUserResponse {
    id: string,
    name: string,
    email: string
}

export interface RegisterUserResponse {
    id: string,
    name: string,
    email: string
}

export type PostPage = { totalPages:number,total: number,page: number,limit: number, posts: PostResponse[] }