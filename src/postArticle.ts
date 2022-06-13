import axios from 'axios';
import emoji from 'node-emoji';
import { prompt, QuestionCollection } from 'inquirer';
import { createHash } from 'crypto';
import { QiitaPost } from '~/types/qiita';
import { loadInitializedAccessToken } from './commons/qiitaSettings';
import { ExtraInputOptions } from '~/types/command';
import { loadArticleFiles, Article } from './commons/articles';

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

    const writeFilePromises: Promise<void>[] = [];
    for (const postFilePath of uploadFiles) {
      const article = new Article(postFilePath);
      const articleProperty = article.getProperty();
      if (!articleProperty) continue;
      if (article.isNew()) {
        const res = await axios.post<QiitaPost>(
          'https://qiita.com/api/v2/items/',
          {
            body: articleProperty.body,
            coediting: articleProperty.coediting,
            group_url_name: articleProperty.group_url_name,
            private: articleProperty.private,
            tags: articleProperty.tags,
            title: articleProperty.title,
            tweet: options.tweet,
          },
          {
            headers: {
              Authorization: `Bearer ${qiitaSetting.token}`,
            },
          }
        );
        if (res.status === 201) {
          // 処理完了メッセージ
          console.log(
            '\n' +
              emoji.get('sparkles') +
              ' New Article "' +
              articleProperty.title +
              '" is created' +
              emoji.get('sparkles') +
              '\n'
          );
          writeFilePromises.push(article.writeFileFromQiitaPost(res.data));
        } else {
          // 記事投稿失敗
          console.log(
            '\n' + emoji.get('disappointed') + ' fail to post new article.\n'
          );
        }
      } else {
        // 記事id
        const articleId: string = articleProperty.id;
        const beforeHash = articleProperty.hash;
        const currentHash = createHash('sha256')
          .update(articleProperty.body)
          .digest('hex');
        // ハッシュ値が同じ=変更がないということなのでその場合は更新しないで次に行く
        if (beforeHash === currentHash) continue;

        const res = await axios.patch<QiitaPost>(
          'https://qiita.com/api/v2/items/' + String(articleId),
          {
            body: articleProperty.body,
            coediting: articleProperty.coediting,
            group_url_name: articleProperty.group_url_name,
            private: articleProperty.private || false,
            tags: articleProperty.tags,
            title: articleProperty.title,
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
              articleProperty.title +
              '" is patched' +
              emoji.get('sparkles') +
              '\n'
          );
          writeFilePromises.push(article.writeFileFromQiitaPost(res.data));
        } else {
          // 記事投稿失敗
          console.log(
            '\n' + emoji.get('disappointed') + ' fail to patch article.\n'
          );
        }
      }
    }
    await Promise.all(writeFilePromises);
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
