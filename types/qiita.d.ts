export interface QiitaPost {
  rendered_body: string;
  body: string;
  coediting: boolean;
  comments_count: number;
  created_at: string;
  group: null;
  id: string;
  likes_count: number;
  private: boolean;
  reactions_count: number;
  tags: Tag[];
  title: string;
  updated_at: string;
  url: string;
  user: User;
  page_views_count: null;
}

export interface QiitaPostResponse {
  rendered_body: string;
  body: string;
  coediting: boolean;
  comments_count: number;
  created_at: string;
  group: null | string;
  id: string;
  likes_count: number;
  private: boolean;
  reactions_count: number;
  tags: [];
  title: string;
  updated_at: string;
  url: string;
  user: {
    description: string;
    facebook_id: string;
    followees_count: number;
    followers_count: number;
    github_login_name: string;
    id: string;
    items_count: number;
    linkedin_id: string;
    location: string;
    name: string;
    organization: string;
    permanent_id: number;
    profile_image_url: string;
    team_only: boolean;
    twitter_screen_name: null | string;
    website_url: string;
  };
  page_views_count: null | string;
  team_membership: null | string;
}

export interface Tag {
  name: string;
  versions: unknown[];
}

export interface User {
  description: null | string;
  facebook_id: null | string;
  followees_count: number;
  followers_count: number;
  github_login_name: null | string;
  id: string;
  items_count: number;
  linkedin_id: null | string;
  location: null | string;
  name: string;
  organization: string | null;
  permanent_id: number;
  profile_image_url: string;
  team_only: boolean;
  twitter_screen_name: null | string;
  website_url: null | string;
}
