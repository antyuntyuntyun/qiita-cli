import axios from 'axios';
import fs from 'fs';
import qiitaSetting from '../qiita.json';
import { QiitaPost } from '@/types/qiita';

export class pullArticle {
  async exec(): Promise<number> {
    try {
      await axios
        .get<QiitaPost[]>('https://qiita.com/api/v2/authenticated_user/items', {
          headers: {
            Authorization: `Bearer ${qiitaSetting.token}`,
          },
        })
        .then((res) => {
          console.log('then');
          // check res data
          const checkResData = res.data;
          fs.writeFile(
            'check/check-resdata-getQiitaPosts.json',
            JSON.stringify(checkResData, null, '    '),
            function (err) {
              if (err) {
                console.log(err);
              }
            }
          );
          // make .md file from res data
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
---

`;
            // sync writ for frontMatter
            fs.writeFileSync(filePath, frontMatter);
            // not sync for article
            fs.appendFileSync(filePath, post.body);
          });
          return 0;
        });
    } catch (e) {
      console.error('error in get Qiita posts: ');
      console.error(e);
      return -1;
    }
    return 1;
  }
}
