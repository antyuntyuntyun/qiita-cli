import axios, { AxiosResponse } from 'axios';
import { QiitaPost, User, AccessToken } from '@/types/qiita';
import { ArticleProperty } from '@/types/article';

export const itemsPerPage = 100;
export const maxPageNumber = 100;

export async function getAccessToken(
  clientId: string,
  clientSecret: string,
  code: string
): Promise<AxiosResponse<AccessToken>> {
  return axios.post('https://qiita.com/api/v2/access_tokens', {
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
  });
}

export async function loadAuthenticatedUser(
  token: string
): Promise<AxiosResponse<User>> {
  return axios.get<User>('https://qiita.com/api/v2/authenticated_user', {
    headers: { Authorization: ['Bearer', token].join(' ') },
  });
}

export async function loadPostItems(
  token: string,
  page: number
): Promise<AxiosResponse<QiitaPost[]>> {
  return axios.get<QiitaPost[]>(
    'https://qiita.com/api/v2/authenticated_user/items',
    {
      params: {
        per_page: itemsPerPage,
        page: page,
      },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function postItem(
  token: string,
  articleProperty: ArticleProperty,
  tweet: boolean
): Promise<AxiosResponse<QiitaPost>> {
  return axios.post<QiitaPost>(
    'https://qiita.com/api/v2/items/',
    {
      body: articleProperty.body,
      coediting: articleProperty.coediting,
      group_url_name: articleProperty.group_url_name,
      private: articleProperty.private,
      tags: articleProperty.tags,
      title: articleProperty.title,
      tweet: tweet,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}

export async function patchItem(
  token: string,
  articleProperty: ArticleProperty
): Promise<AxiosResponse<QiitaPost>> {
  return axios.patch<QiitaPost>(
    'https://qiita.com/api/v2/items/' + String(articleProperty.id),
    {
      body: articleProperty.body,
      coediting: articleProperty.coediting,
      group_url_name: articleProperty.group_url_name,
      private: articleProperty.private,
      tags: articleProperty.tags,
      title: articleProperty.title,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
}
