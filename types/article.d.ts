export interface ArticleProperty {
  id: string;
  title: string;
  coediting: boolean;
  group_url_name?: string;
  private: boolean;
  tags: ArticleTag[];
  url?: string;
  likes_count?: number;
  created_at?: string;
  updated_at?: string;
  hash: string;
  body: string;
}

interface ArticleTag {
  name: string;
}
