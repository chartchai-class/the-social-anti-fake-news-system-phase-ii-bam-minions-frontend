export interface News{
    id: number;
    topic: string;
    short_detail: string;
    detail: string;
    created_at: string;
    reporter: UserReporter;
    comments: Comment[];
    fakeCount: number
    notFakeCount: number
    status: NewsStatus;
    image: string[];
}

export type NewsStatus = 'UNVERIFIED' | 'FAKE' | 'NOT_FAKE' | 'TIE'

export interface Comment{
    id: number;
    content: string;
    create_at: string;
    usercomment: UserReporter
}

export interface NewsState{
  news: News | null;
}

export interface UserReporter {
  id: number
  firstname: string
  lastname: string
  username: string
  email: string
  imageUrl?: string | null
}