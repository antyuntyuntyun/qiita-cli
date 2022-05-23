import axios from 'axios';
import fs from 'fs';
import path from 'path';
// import 形式だとファイルが存在しない状態でエラーが起こるので、import形式を一旦取りやめる
// import qiitaSetting from '../qiita.json';
import { QiitaPost } from '@/types/qiita';
import { loadInitializedAccessToken } from './commons/qiitaSettings';

export async function getArticle(articleId: string): Promise<number> {
  try {
    const qiitaSetting: { token: string } | null = loadInitializedAccessToken();
    if (!qiitaSetting) {
      return -1;
    }

    const res = await axios.get<QiitaPost>(
      'https://qiita.com/api/v2/items/' + articleId,
      {
        headers: {
          Authorization: `Bearer ${qiitaSetting.token}`,
        },
      }
    );
    // make .md file from res data
    const dir: string = path.join('articles', res.data.title);
    const saveFilePath: string = path.join(dir, res.data.id + '.md');
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
    fs.writeFileSync(saveFilePath, frontMatter);
    // write body
    fs.appendFileSync(saveFilePath, res.data.body);

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
