export interface ArticleProperty {
  id: string;
  title: string;
  coediting: boolean;
  group_url_name?: string;
  private: boolean;
  tags: ArticleTag[];
  url?: string;
  created_at?: string;
  updated_at?: string;
  hash: string;
  body: string;
}

interface ArticleTag {
  name: string;
}
