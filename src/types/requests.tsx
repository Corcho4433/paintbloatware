
export interface PostResponse {
    id: string,
    image_json: string,
    title: string,
    user: {
        name: string,
        id: number,
    },
    _count: {
        comments: number,
    }
}

export interface UserRegistrationRequest {
  name: string,
  email: string,
  password: string
};
export interface LoginUserRequest {
    mail: string,
    password:string
}

export type PostPage = PostResponse[]