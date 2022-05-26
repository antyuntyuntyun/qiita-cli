import axios, { AxiosResponse } from 'axios';
import emoji from 'node-emoji';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
// import 形式だとファイルが存在しない状態でエラーが起こるので、import形式を一旦取りやめる
// import qiitaSetting from '../qiita.json';
import { QiitaPost, User } from '@/types/qiita';
import { loadInitializedAccessToken } from './commons/qiitaSettings';
import { writeFrontmatterMarkdownFileWithQiitaPost } from './commons/articlesDirectory';
import { ExtraInputOptions } from '~/types/command';

const itemsPerPage = 100;
const maxPageNumber = 100;

export async function pullArticle(options: ExtraInputOptions): Promise<number> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const qiitaSetting: { token: string } | null = options.token
      ? { token: options.token }
      : loadInitializedAccessToken();
    if (!qiitaSetting) {
      return -1;
    }

    console.log('fetching article ... ');

    const authenticatedUser = await loadAuthenticatedUser(options.token);
    // 公開している記事数
    const itemCount = authenticatedUser.data.items_count;
    for (let page = 1; page <= maxPageNumber; ++page) {
      const res = await loadPostItems(qiitaSetting.token, page);
      // make .md file from res data
      console.log('------------------------------------------');
      for (const post of res.data) {
        console.log(post.id + ': ' + post.title);
        const dir: string = path.join(options.project, post.title);
        const filePath: string = path.join(dir, post.id + '.md');
        fs.mkdirSync(dir, { recursive: true });
        writeFrontmatterMarkdownFileWithQiitaPost(filePath, post);
      }
      console.log('------------------------------------------');
      if (itemCount <= page * itemsPerPage) {
        break;
      }
    }
    // 処理完了メッセージ
    console.log(
      '\n' +
        emoji.get('sparkles') +
        ' Article fetching completed. ' +
        emoji.get('sparkles') +
        '\n'
    );
    return 0;
  } catch (e) {
    const red = '\u001b[31m';
    const reset = '\u001b[0m';
    console.error('\n' + red + 'error in get Qiita posts: ' + reset + '\n');
    console.error(e);
    return -1;
  }
  return 1;
}

async function loadAuthenticatedUser(
  token: string
): Promise<AxiosResponse<User>> {
  return axios.get<User>('https://qiita.com/api/v2/authenticated_user', {
    headers: { Authorization: ['Bearer', token].join(' ') },
  });
}

async function loadPostItems(
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
