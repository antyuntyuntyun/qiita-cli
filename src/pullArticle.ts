import emoji from 'node-emoji';
import fs from 'fs';
import path from 'path';
// import 形式だとファイルが存在しない状態でエラーが起こるので、import形式を一旦取りやめる
// import qiitaSetting from '../qiita.json';
import { loadInitializedAccessToken } from './commons/qiitaSettings';
import { ExtraInputOptions } from '~/types/command';
import { loadCurrentIdToArticle, Article } from './commons/articles';
import {
  itemsPerPage,
  maxPageNumber,
  loadAuthenticatedUser,
  loadPostItems,
} from './commons/qiitaApis';

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

    const currentIdArticles: {
      [articleId: string]: Article;
    } = loadCurrentIdToArticle(options.project);
    const authenticatedUser = await loadAuthenticatedUser(options.token);
    // 公開している記事数
    const itemCount = authenticatedUser.data.items_count;
    for (let page = 1; page <= maxPageNumber; ++page) {
      const res = await loadPostItems(qiitaSetting.token, page);
      const fileWritePromises: Promise<void>[] = [];
      // make .md file from res data
      console.log('------------------------------------------');
      for (const post of res.data) {
        console.log(post.id + ': ' + post.title);
        if (currentIdArticles[post.id]) {
          const article = currentIdArticles[post.id];
          fileWritePromises.push(article.writeFileFromQiitaPost(post));
        } else {
          const dir: string = path.join(options.project, post.title);
          const filePath: string = path.join(dir, post.id + '.md');
          fs.mkdirSync(dir, { recursive: true });
          const article = new Article(filePath);
          fileWritePromises.push(article.writeFileFromQiitaPost(post));
        }
      }
      console.log('------------------------------------------');
      await Promise.all(fileWritePromises);
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
