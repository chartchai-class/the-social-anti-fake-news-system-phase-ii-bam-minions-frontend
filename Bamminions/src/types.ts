export interface News{
    id: number;
    topic: string;
    short_detail: string;
    detail: string;
    created_at: string;
    image: string[];
}

export interface Comment{
    id: number;
    content: string;
    create_at: string;
}

export interface NewsState{
  news: News | null;
}
