/* eslint-disable @typescript-eslint/restrict-template-expressions */
// import axios from 'axios';
import emoji from 'node-emoji';
import fs from 'fs';
import { Answers, prompt, QuestionCollection } from 'inquirer';
import path from 'path';
import matter from 'gray-matter';
import { ExtraInputOptions } from '~/types/command';

export async function newArticle(options: ExtraInputOptions): Promise<number> {
  try {
    console.log('Qiita 記事新規作成\n');

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

    // 作業ディレクトリに記事用フォルダを作成
    const articleBaseDir = options.project;
    if (!fs.existsSync(articleBaseDir)) {
      fs.mkdirSync(articleBaseDir);
    }

    // ユーザ入力を元に記事フォルダ/ファイル作成
    const articleDir = path.join(articleBaseDir, answers.article_title);
    const articlePath = path.join(articleDir, 'not_uploaded.md');
    if (fs.existsSync(articleDir)) {
      // ユーザ入出力形式指定
      const inputYesNoBoolQuestions: QuestionCollection = [
        {
          type: 'confirm',
          message:
            '同名記事が既に存在します。新規作成により上書きされますが、よろしいですか？: ',
          name: 'yesNoBool',
        },
      ];
      const answers: Answers | { yesNoBool: boolean } = await prompt(
        inputYesNoBoolQuestions
      );
      if (!answers.yesNoBool) {
        console.log(
          '\n' + emoji.get('hatched_chick') + ' 処理を中止しました\n'
        );
        return 0;
      }
    } else {
      fs.mkdirSync(articleDir);
    }
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

## ファイル名は変更しないで！

qiita cliはローカル上で新規記事/修正記事かどうかはファイル名により判断します.
\`not_uploaded.md\`というファイル名はそのままに ${emoji.get('bow')}
`;
    const saveMarkdownFile = matter.stringify(body, {
      id: '',
      title: answers.article_title,
      tags: [{ name: 'qiita-cli' }],
    });
    // write frontMatter
    fs.writeFileSync(articlePath, saveMarkdownFile);

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
