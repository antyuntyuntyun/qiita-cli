import axios, { AxiosResponse } from 'axios';
import { QiitaPost, User } from '@/types/qiita';

export const itemsPerPage = 100;
export const maxPageNumber = 100;

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
