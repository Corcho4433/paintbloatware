
export interface PostResponse {
    id: string,
    url_bucket: string,
    title: string,
    height: number,
    width: number,
    version: number,
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

export type PostPage = { posts: PostResponse[] }