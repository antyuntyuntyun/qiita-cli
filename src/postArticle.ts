/* eslint-disable @typescript-eslint/restrict-template-expressions */
// import axios from 'axios';
import axios from 'axios';
import emoji from 'node-emoji';
import fs from 'fs';
import { Answers, prompt, QuestionCollection } from 'inquirer';
import remarkExtractFrontmatter from 'remark-extract-frontmatter';
import remarkFrontmatter from 'remark-frontmatter';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import yaml from 'yaml';
import unified from 'unified';
import path from 'path';
import { QiitaPostResponse, Tag, FrontMatterParseResult } from '~/types/qiita';
import { getArticle } from './getArticle';
import { loadInitializedAccessToken } from './commons/qiita-settings';

export async function postArticle(): Promise<number> {
  try {
    const qiitaSetting: { token: string } | null = loadInitializedAccessToken();
    if (!qiitaSetting) {
      return -1;
    }

    console.log('Qiita 記事投稿\n\n');
    console.log(
      'aricleディレクトリのある作業ディレクトリでコマンド実行している前提での処理です.'
    );
    console.log(
      'articleディレクトリ内の not_uploaded.md ファイルが投稿候補記事として認識されます\n\n'
    );
    const articleBaseDir = 'articles';

    //   TODO: utill化
    const listFiles = (dir: string): string[] =>
      fs
        .readdirSync(dir, { withFileTypes: true })
        .flatMap((dirent) =>
          dirent.isFile()
            ? [path.join(dir, dirent.name)]
            : listFiles(path.join(dir, dirent.name))
        );

    // ファイル名がnot_uploaded.mdとなっているものを取得
    const filePathList: string[] = listFiles(articleBaseDir).filter((item) =>
      item.includes('not_uploaded.md')
    );

    if (filePathList.length === 0) {
      console.log(
        '\n' +
          emoji.get('disappointed') +
          ' There are no "not_uploaded.md" files\n'
      );
      console.log(emoji.get('hatched_chick') + ' 処理を中止しました\n');
      return 1;
    }
    const articleNameList: string[] = filePathList.map((item) => {
      // articlesフォルダ直下に記事名が記載されているフォルダが存在する前提
      return item.split('/')[1];
    });

    //   typ: 'checkbox'とすることで、複数選択可能状態にできるが、シェル上で挙動が不安定になるので、一旦単一選択のlistを採用
    const inputQuestions: QuestionCollection = [
      {
        type: 'list',
        message: 'アップロードする記事を選択してください: ',
        name: 'uploadArticles',
        choices: articleNameList,
      },
    ];
    const answers: Answers | { uploadArticles: string } = await prompt(
      inputQuestions
    );

    //   TODO: 複数選択対応
    const uploadArticlePath: string | undefined = listFiles(
      articleBaseDir
    ).find((item) => item.includes(answers.uploadArticles));

    // front-matter付きmarkdownのパース
    const inputArticle = fs.readFileSync(String(uploadArticlePath));
    const processor = unified()
      .use(remarkParse)
      .use(remarkFrontmatter, [
        {
          type: 'yaml',
          marker: '-',
          anywhere: false, // ファイルの冒頭に Front Matter がある前提で探索する
        },
      ])
      .use(remarkExtractFrontmatter, {
        yaml: yaml.parse,
        name: 'frontMatter', // result.data 配下のキー名を決める
      })
      .use(remarkRehype)
      .use(rehypeStringify);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any | FrontMatterParseResult = await processor.process(
      inputArticle
    );
    //   console.log(result);

    // 記事タイトル
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const title: unknown | string = result.data.frontMatter.title;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const tags: unknown | Tag[] = result.data.frontMatter.tags;

    if (!tags) {
      console.log(
        '\n' +
          emoji.get('disappointed') +
          ' 選択した記事にタグが設定されていません.\n記事を投稿するには一つ以上タグが設定されている必要があります.\n'
      );
      return -1;
    }

    // 記事本文
    // bufferでなく文字列として読み込み
    const articleContents = fs.readFileSync(String(uploadArticlePath), 'utf-8');
    // フロント・マターを区切り文字で検索し、フロント・マター以降を抽出
    const startIndex = articleContents.indexOf(
      '---',
      articleContents.indexOf('---') + 1
    );
    const articleContentsBody = articleContents.substr(startIndex + 4);

    // 記事投稿成功時に生成される記事idを格納する
    let articleId = '';

    const res = await axios.post<QiitaPostResponse>(
      'https://qiita.com/api/v2/items/',
      {
        body: articleContentsBody,
        coediting: false,
        group_url_name: 'dev',
        private: false,
        tags: tags,
        title: title,
        tweet: false,
      },
      {
        headers: {
          Authorization: `Bearer ${qiitaSetting.token}`,
        },
      }
    );
    // console.log(res);
    if (res.status === 201) {
      // 記事投稿成功
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      articleId = String(res.data.id);
      // 処理完了メッセージ
      console.log(
        '\n' +
          emoji.get('sparkles') +
          ' New Article "' +
          String(title) +
          '" is created' +
          emoji.get('sparkles') +
          '\n'
      );
    } else {
      // 記事投稿失敗
      console.log(
        '\n' + emoji.get('disappointed') + ' fail to post new article.\n'
      );
      return -1;
    }
    // 投稿した記事を取得
    await getArticle(articleId);
    // 投稿前状態のファイルを削除
    fs.unlinkSync(String(uploadArticlePath));
    return 0;
  } catch (e) {
    const red = '\u001b[31m';
    const reset = '\u001b[0m';
    console.error('\n' + red + 'error in create new article: ' + reset + '\n');
    console.error(e);
    return -1;
  }
  return 1;
}
