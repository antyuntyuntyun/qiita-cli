import axios from 'axios';
import emoji from 'node-emoji';
import fs from 'fs';
// import 形式だとファイルが存在しない状態でエラーが起こるので、import形式を一旦取りやめる
// import qiitaSetting from '../qiita.json';
import { QiitaPost } from '@/types/qiita';

export class getArticle {
  async exec(articleId: string): Promise<number> {
    try {
      // アクセストークン情報をqiita.jsonから取得
      // qiita init で事前に設定されている必要あり
      const homeDir =
        process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const qiitaDir = `${homeDir}/.qiita`;
      const filePath = `${qiitaDir}/qiita.json`;
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

      await axios
        .get<QiitaPost>('https://qiita.com/api/v2/items/' + articleId, {
          headers: {
            Authorization: `Bearer ${qiitaSetting.token}`,
          },
        })
        .then((res) => {
          // make .md file from res data
          const dir: string = 'articles/' + res.data.title + '/';
          const filePath: string = dir + res.data.id + '.md';
          fs.mkdirSync(dir, { recursive: true });
          const frontMatter = `---
id: ${res.data.id}
title: ${res.data.title}
created_at: ${res.data.created_at}
updated_at: ${res.data.updated_at}
tags: ${String(JSON.stringify(res.data.tags))}
private: ${String(res.data.private)}
url: ${String(res.data.url)}
likes_count: ${String(res.data.likes_count)}
---`;
          // write frontMatter
          fs.writeFileSync(filePath, frontMatter);
          // write body
          fs.appendFileSync(filePath, res.data.body);

          return 0;
        });
    } catch (e) {
      const red = '\u001b[31m';
      const reset = '\u001b[0m';
      console.error('\n' + red + 'error in get Qiita posts: ' + reset + '\n');
      console.error(e);
      return -1;
    }
    return 1;
  }
}
