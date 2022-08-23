/* eslint-disable @typescript-eslint/restrict-template-expressions */
import emoji from 'node-emoji';
import fs from 'fs';
import { Answers, prompt, QuestionCollection } from 'inquirer';
import path from 'path';
import { randomBytes } from 'crypto';
import { Article } from './commons/articles';
import { ExtraInputOptions } from '~/types/command';

export async function newArticle(options: ExtraInputOptions): Promise<number> {
  try {
    console.log('Qiita 記事新規作成\n');

    let articleTitle = '新しい記事のタイトル';
    if (!options.simplify) {
      // ユーザ入出力形式指定用変数
      const inputArticleTitleQuestions: QuestionCollection = [
        {
          type: 'input',
          message: '記事タイトル: ',
          name: 'article_title',
        },
      ];
      const answers: Answers | { article_title: string } = await prompt(
        inputArticleTitleQuestions
      );
      articleTitle = answers.article_title;
    }

    const articleBaseDir = options.project;
    // Qiitaのidっぽいランダムな文字列を生成
    const newArticleFileName = randomBytes(10).toString('hex');
    // 記事のタイトルを基にフォルダ/ファイル作成
    const articlePath = path.join(articleBaseDir, articleTitle, `${newArticleFileName}.md`);
    if (fs.existsSync(articlePath)) {
      console.log(
        '\n' +
          emoji.get('hatched_chick') +
          ' すでに記事が存在していたので、処理を中止しました\n'
      );
      return 0;
    }
    // 作業フォルダに記事用フォルダを作成
    fs.mkdirSync(path.dirname(articlePath), { recursive: true });
    const body = `
ここから本文を書く
# ${emoji.get('hatched_chick')} qiita cliによる自動生成です.

上記ハイフンで囲まれた部分(フロント・マター)より下のこちらの部分を編集して記事本文を作成してください.
フロント・マター以下の本文含めた自動生成された部分は削除して構いません. 
自動生成に倣い,フロント・マター以下に1行改行を加え、markdown形式で記載してください

## 記事へのタグ付け

フロント・マターのtagsに以下のように配列形式でtagを記載することが可能です.
投稿するには、一つ以上のtagが設定されている必要があります.
フロント・マターへのtag追記例
\`\`\`
tags: [{"name":"C++","versions":[]},{"name":"AtCoder","versions":[]}]
\`\`\`
`;
    const article = new Article(articlePath);
    await article.writeFileFromQiitaPost({
      id: '',
      title: articleTitle,
      tags: [{ name: 'qiita-cli' }],
      private: true,
      body: body,
    });
    // 処理完了メッセージ
    console.log(
      '\n' +
        emoji.get('sparkles') +
        ' Template article creation is complete. ' +
        emoji.get('sparkles') +
        '\n'
    );
    console.log('Your template article has been saved to the following path:');
    console.log('\n' + '\t' + articlePath + '\n');
    return 0;
  } catch (e) {
    const red = '\u001b[31m';
    const reset = '\u001b[0m';
    console.error('\n' + red + 'error in make new article: ' + reset + '\n');
    console.error(e);
    return -1;
  }
  return 1;
}
