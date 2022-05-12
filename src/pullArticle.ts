import axios from 'axios';
import emoji from 'node-emoji';
import fs from 'fs';
import path from 'path';
// import 形式だとファイルが存在しない状態でエラーが起こるので、import形式を一旦取りやめる
// import qiitaSetting from '../qiita.json';
import { QiitaPost } from '@/types/qiita';

export async function pullArticle(): Promise<number> {
  try {
    // アクセストークン情報をqiita.jsonから取得
    // qiita init で事前に設定されている必要あり
    const homeDir =
      process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] || '';
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const qiitaDir = path.join(homeDir, '.qiita');
    const filePath = path.join(qiitaDir, 'qiita.json');
    if (!fs.existsSync(filePath)) {
      console.log(
        emoji.get('disappointed') + ' アクセストークンが設定されていません.\n'
      );
      console.log(
        'qiita init コマンドを実行してアクセストークンを設定してください.\n'
      );
      return -1;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const qiitaSetting: { token: string } = JSON.parse(
      fs.readFileSync(filePath, 'utf-8')
    );

    console.log('fetching article ... ');

    const res = await axios.get<QiitaPost[]>(
      'https://qiita.com/api/v2/authenticated_user/items',
      {
        headers: {
          Authorization: `Bearer ${qiitaSetting.token}`,
        },
      }
    );
    // make .md file from res data
    console.log('------------------------------------------');
    res.data.map((post) => {
      console.log(post.id + ': ' + post.title);
      const dir: string = 'articles/' + post.title + '/';
      const filePath: string = dir + post.id + '.md';
      fs.mkdirSync(dir, { recursive: true });
      const frontMatter = `---
id: ${post.id}
title: ${post.title}
created_at: ${post.created_at}
updated_at: ${post.updated_at}
tags: ${String(JSON.stringify(post.tags))}
private: ${String(post.private)}
url: ${String(post.url)}
likes_count: ${String(post.likes_count)}
---

`;
      // write frontMatter
      fs.writeFileSync(filePath, frontMatter);
      // write body
      fs.appendFileSync(filePath, post.body);
    });
    console.log('------------------------------------------');
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
