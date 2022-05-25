import axios from 'axios';
import emoji from 'node-emoji';
import fs from 'fs';
import { prompt, QuestionCollection } from 'inquirer';
import matter, { GrayMatterFile } from 'gray-matter';
import { QiitaPostResponse, Tag } from '~/types/qiita';
import { loadInitializedAccessToken } from './commons/qiitaSettings';
import { loadArticleFiles } from './commons/articlesDirectory';
import { ExtraInputOptions } from '~/types/command';

export async function postArticle(options: ExtraInputOptions): Promise<number> {
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
      'articleディレクトリ内の not_uploaded.md ファイルが投稿候補記事として認識されます\n\n'
    );
    const articleBaseDir = 'articles';

    const filePathList: string[] = loadArticleFiles(articleBaseDir);
    const newPostCandidateMatterMarkdowns: GrayMatterFile<string>[] = [];
    for (const filePath of filePathList) {
      const parsedMatter = matter(fs.readFileSync(filePath, 'utf-8'));
      if (!parsedMatter.data.id && parsedMatter.data.title) {
        newPostCandidateMatterMarkdowns.push(parsedMatter);
      }
    }

    if (newPostCandidateMatterMarkdowns.length === 0) {
      console.log(
        '\n' +
          emoji.get('disappointed') +
          ' There are no "will_be_patched.md" files\n'
      );
      console.log(emoji.get('hatched_chick') + ' 処理を中止しました\n');
      return 1;
    }

    //   typ: 'checkbox'とすることで、複数選択可能状態にできるが、シェル上で挙動が不安定になるので、一旦単一選択のlistを採用
    const inputQuestions: QuestionCollection = [
      {
        type: 'list',
        message: 'アップロードする記事を選択してください: ',
        name: 'uploadArticles',
        choices: newPostCandidateMatterMarkdowns.map(
          (candidate) => candidate.data.title
        ),
      },
    ];
    const answers = await prompt(inputQuestions);

    //   TODO: 複数選択対応
    const uploadMatterMarkdown: GrayMatterFile<string> | undefined =
      newPostCandidateMatterMarkdowns.find(
        (item) => item.data.title === answers.uploadArticles
      );

    if (!uploadMatterMarkdown) {
      // 記事投稿失敗
      console.log(
        '\n' + emoji.get('disappointed') + ' fail to post new article.\n'
      );
      return -1;
    }

    // 記事タイトル
    const title: string = uploadMatterMarkdown.data.title || '';
    const tags: Tag[] = uploadMatterMarkdown.data.tags || [];

    // 記事本文
    const articleContentsBody = uploadMatterMarkdown.content;

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
    if (res.status === 201) {
      // 記事投稿成功
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const articleId = String(res.data.id);
      // 処理完了メッセージ
      console.log(
        '\n' +
          emoji.get('sparkles') +
          ' New Article "' +
          title +
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
