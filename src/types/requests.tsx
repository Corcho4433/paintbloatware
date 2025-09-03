
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
    mail: string,
    password: string
}

export type PostPage = { posts: PostResponse[] }