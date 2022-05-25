// import axios from 'axios';
import axios from 'axios';
import emoji from 'node-emoji';
import fs from 'fs';
import { Answers, prompt, QuestionCollection } from 'inquirer';
import path from 'path';
import matter, { GrayMatterFile } from 'gray-matter';
import { QiitaPostResponse, Tag } from '~/types/qiita';
import { loadInitializedAccessToken } from './commons/qiitaSettings';
import { loadArticleFiles } from './commons/articlesDirectory';
import { ExtraInputOptions } from '~/types/command';

export async function patchArticle(
  options: ExtraInputOptions
): Promise<number> {
  try {
    const qiitaSetting: { token: string } | null = options.token
      ? { token: options.token }
      : loadInitializedAccessToken();
    if (!qiitaSetting) {
      return -1;
    }

    console.log('Qiita 記事投稿\n\n');
    console.log(
      'aricleディレクトリのある作業ディレクトリでコマンド実行している前提での処理です.'
    );
    console.log(
      'articleディレクトリ内の will_be_patched.md ファイルが投稿候補記事として認識されます\n\n'
    );
    const articleBaseDir = 'articles';

    // ファイル名がwill_be_patched.mdとなっているものを取得
    const filePathList: string[] = loadArticleFiles(articleBaseDir).filter(
      (item) => item.includes('will_be_patched.md')
    );

    if (filePathList.length === 0) {
      console.log(
        '\n' +
          emoji.get('disappointed') +
          ' There are no "will_be_patched.md" files\n'
      );
      console.log(emoji.get('hatched_chick') + ' 処理を中止しました\n');
      return 1;
    }
    const articleNameList: string[] = filePathList.map((item) => {
      // mdファイルの上に記事名が記載されているフォルダが存在する想定
      return path.basename(path.dirname(item));
    });

    //   typ: 'checkbox'とすることで、複数選択可能状態にできるが、シェル上で挙動が不安定になるので、一旦単一選択のlistを採用
    const inputQuestions: QuestionCollection = [
      {
        type: 'list',
        message: '修正アップロードする記事を選択してください: ',
        name: 'uploadArticles',
        choices: articleNameList,
      },
    ];
    const answers: Answers | { uploadArticles: string } = await prompt(
      inputQuestions
    );

    //   TODO: 複数選択対応
    const uploadArticlePath: string | undefined = loadArticleFiles(
      articleBaseDir
    ).find((item) => item.includes(answers.uploadArticles));

    // front-matter付きmarkdownのパース
    const parsedMatterMarkdown: GrayMatterFile<string> = matter(
      fs.readFileSync(String(uploadArticlePath), 'utf-8')
    );

    // 記事タイトル
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const title: string = parsedMatterMarkdown.data.title;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const tags: unknown | Tag[] = parsedMatterMarkdown.data.tags;

    if (!tags) {
      console.log(
        '\n' +
          emoji.get('disappointed') +
          ' 選択した記事にタグが設定されていません.\n記事を投稿するには一つ以上タグが設定されている必要があります.\n'
      );
      return -1;
    }

    // 記事本文
    const articleContentsBody = parsedMatterMarkdown.content;

    // 記事id
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const articleId: unknown | string = parsedMatterMarkdown.data.id;

    const res = await axios.patch<QiitaPostResponse>(
      'https://qiita.com/api/v2/items/' + String(articleId),
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
    //   console.log(res);
    if (res.status === 200) {
      // 記事投稿成功
      // 処理完了メッセージ
      console.log(
        '\n' +
          emoji.get('sparkles') +
          ' Article "' +
          String(title) +
          '" is patched' +
          emoji.get('sparkles') +
          '\n'
      );
    } else {
      // 記事投稿失敗
      console.log(
        '\n' + emoji.get('disappointed') + ' fail to patch article.\n'
      );
      return -1;
    }
    // ファイルリネーム
    fs.renameSync(
      String(uploadArticlePath),
      String(uploadArticlePath).replace('will_be_patched', String(articleId))
    );
    return 0;
  } catch (e) {
    const red = '\u001b[31m';
    const reset = '\u001b[0m';
    console.error('\n' + red + 'error in patch article: ' + reset + '\n');
    console.error(e);
    return -1;
  }
  return 1;
}
