import axios from 'axios';
import emoji from 'node-emoji';
import fs from 'fs';
import { prompt, QuestionCollection } from 'inquirer';
import matter, { GrayMatterFile } from 'gray-matter';
import { QiitaPost, Tag } from '~/types/qiita';
import { loadInitializedAccessToken } from './commons/qiitaSettings';
import {
  loadArticleFiles,
  writeFrontmatterMarkdownFileWithQiitaPost,
} from './commons/articlesDirectory';
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
    const uploadFiles: Set<string> = new Set<string>();
    if (options.all) {
      const allFiles = loadArticleFiles(options.project);
      for (const file of allFiles) {
        uploadFiles.add(file);
      }
    } else if (options.file) {
      uploadFiles.add(options.file);
    } else {
      const selectedFile = await selectPostFilePath(
        loadArticleFiles(options.project)
      );
      if (selectedFile) {
        uploadFiles.add(selectedFile);
      }
    }
    if (uploadFiles.size <= 0) {
      console.log(
        '\n' +
          emoji.get('disappointed') +
          ' There are no "not_uploaded.md" files\n'
      );
      console.log(emoji.get('hatched_chick') + ' 処理を中止しました\n');
      return 1;
    }

    for (const postFilePath of uploadFiles) {
      const uploadMatterMarkdown: GrayMatterFile<string> = matter(
        fs.readFileSync(postFilePath, 'utf-8')
      );

      // 記事タイトル
      const title: string = uploadMatterMarkdown.data.title || '';
      const tags: Tag[] = uploadMatterMarkdown.data.tags || [];

      // 記事本文
      const articleContentsBody = uploadMatterMarkdown.content;

      if (uploadMatterMarkdown.data.id) {
        // 記事id
        const articleId: string = uploadMatterMarkdown.data.id;

        const res = await axios.patch<QiitaPost>(
          'https://qiita.com/api/v2/items/' + String(articleId),
          {
            body: articleContentsBody,
            coediting: uploadMatterMarkdown.data.coediting,
            group_url_name: uploadMatterMarkdown.data.group_url_name,
            private: uploadMatterMarkdown.data.private || false,
            tags: tags,
            title: title,
          },
          {
            headers: {
              Authorization: `Bearer ${qiitaSetting.token}`,
            },
          }
        );
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
          writeFrontmatterMarkdownFileWithQiitaPost(postFilePath, res.data);
        } else {
          // 記事投稿失敗
          console.log(
            '\n' + emoji.get('disappointed') + ' fail to patch article.\n'
          );
        }
      } else {
        const res = await axios.post<QiitaPost>(
          'https://qiita.com/api/v2/items/',
          {
            body: articleContentsBody,
            coediting: uploadMatterMarkdown.data.coediting,
            group_url_name: uploadMatterMarkdown.data.group_url_name,
            private: uploadMatterMarkdown.data.private || false,
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
          const postData = res.data;
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
          writeFrontmatterMarkdownFileWithQiitaPost(postFilePath, postData);
        } else {
          // 記事投稿失敗
          console.log(
            '\n' + emoji.get('disappointed') + ' fail to post new article.\n'
          );
        }
      }
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

async function selectPostFilePath(
  candidateFilePathList: string[]
): Promise<string> {
  if (candidateFilePathList.length === 0) {
    return '';
  }

  //   typ: 'checkbox'とすることで、複数選択可能状態にできるが、シェル上で挙動が不安定になるので、一旦単一選択のlistを採用
  const inputQuestions: QuestionCollection = [
    {
      type: 'list',
      message: 'アップロードする記事を選択してください: ',
      name: 'uploadArticles',
      choices: candidateFilePathList,
    },
  ];
  const answers = await prompt(inputQuestions);

  return answers.uploadArticles;
}
