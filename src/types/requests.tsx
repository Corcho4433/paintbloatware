
export interface PostIDResponse { post: PostResponse }
export interface PostResponse {
  id: string,
  url_bucket: string,
  title: string,
  content: string,
  description: string,
  created_at: string,
  edited: boolean,
  TagsForPost: { tag: { name: string } }[],
  user: {
    name: string,
    id: number,
    urlPfp?: string,
  },
  _count: {
    comments: number,
  },
  rating: number;
}

// Base Comment interface
export interface Comment {
  id: string;

  content: string;
  user: {
    name: string,
    id: number,
    urlPfp?: string,
  },
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
export type PostPageResponse = {

  comments: Comment[];
  currentPage: number;
  maxPages: number;
  totalCount: number;

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
  success: boolean,
  data:
  {
    id: string,
    pfp?: string
  }
}

export interface UserUpdateInterface {
	email?: string
	name?: string
	description?: string
}



export interface RegisterUserResponse {
  success: boolean,
  data:
  {
    id: string,
    pfp?: string
  }
}

export type PostPage = { maxPages: number, currentPage: number, totalCount: number, posts: PostResponse[] }