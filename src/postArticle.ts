import emoji from 'node-emoji';
import path from 'path';
import { prompt, QuestionCollection } from 'inquirer';
import { loadInitializedAccessToken } from './commons/qiitaSettings';
import { ExtraInputOptions } from '~/types/command';
import { loadArticleFiles, calcArticleHash, Article } from './commons/articles';
import { postItem, patchItem } from './commons/qiitaApis';

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
      `${options.project}フォルダ以下にあるmdファイルを投稿していきます`
    );
    const uploadFiles: Set<string> = await buildWillUploadFilePathSet(options);
    if (uploadFiles.size <= 0) {
      console.log(
        '\n' + emoji.get('disappointed') + ' ファイルが見つかりませんでした\n'
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
        const res = await postItem(
          qiitaSetting.token,
          articleProperty,
          options.tweet
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
          if (options.overwrite) {
            const articlePath = path.join(
              options.project,
              res.data.title,
              `${res.data.id}.md`
            );
            writeFilePromises.push(article.renameFile(articlePath));
          }
        } else {
          // 記事投稿失敗
          console.log(
            '\n' + emoji.get('disappointed') + ' fail to post new article.\n'
          );
        }
      } else {
        const beforeHash = articleProperty.hash;
        const currentHash = calcArticleHash(articleProperty);
        // ハッシュ値が同じ=変更がないということなのでその場合は更新しないで次に行く
        if (beforeHash === currentHash) continue;

        const res = await patchItem(qiitaSetting.token, articleProperty);
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

async function buildWillUploadFilePathSet(
  options: ExtraInputOptions
): Promise<Set<string>> {
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
  return uploadFiles;
}

async function selectPostFilePath(
  candidateFilePathList: string[]
): Promise<string> {
  if (candidateFilePathList.length === 0) {
    return '';
  }

  // typ: 'checkbox'とすることで、複数選択可能状態にできるが、シェル上で挙動が不安定になるので、一旦単一選択のlistを採用
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
