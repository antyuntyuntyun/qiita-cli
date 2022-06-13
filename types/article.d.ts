export interface ArticleProperty {
  id: string;
  title: string;
  private: boolean;
  coediting?: string;
  group_url_name?: string;
  tags: ArticleTag[];
  created_at?: string;
  updated_at?: string;
  url?: string;
  likes_count?: number;
  hash: string;
  body: string;
}

interface ArticleTag {
  name: string;
}
