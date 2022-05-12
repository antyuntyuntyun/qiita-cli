import axios from 'axios';
import fs from 'fs';
import emoji from 'node-emoji';
import open from 'open';
import { Answers, prompt, QuestionCollection } from 'inquirer';
import sleep from 'sleep-promise';
import { User } from '@/types/qiita';

export async function accessTokenInitialize(): Promise<number> {
  try {
    const homeDir =
      process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const qiitaDir = `${homeDir}/.qiita`;
    if (!fs.existsSync(qiitaDir)) {
      fs.mkdirSync(qiitaDir);
    }
    const filePath = `${qiitaDir}/qiita.json`;
    // ユーザ入力形式指定用変数
    let inputQuestions: QuestionCollection;

    if (fs.existsSync(filePath)) {
      // ユーザ入出力形式指定
      inputQuestions = [
        {
          type: 'confirm',
          message:
            '設定ファイルが既に存在します。設定が上書きされますが、よろしいですか？: ',
          name: 'yesNoBool',
        },
      ];
      const answers: Answers | { yesNoBool: boolean } = await prompt(
        inputQuestions
      );
      if (!answers.yesNoBool) {
        console.log(
          '\n' + emoji.get('hatched_chick') + ' 処理を中止しました\n'
        );
        return 0;
      }
    }

    console.log(
      'Qiiaの管理者画面にてアクセストークンを発行し、トークンをcliに入力してください\n'
    );
    await sleep(1500);
    // 1.5 seconds later
    // open qiita admin by web default web browser
    await open('https://qiita.com/settings/applications');

    // ユーザ入出力形式指定
    inputQuestions = [
      {
        type: 'input',
        message: 'Qiita AccessToken: ',
        name: 'token',
      },
    ];

    // ユーザ入力(prompt())
    // TODO: 入力されるアクセストークンをシェル上で非表示にする
    const answers: Answers | { token: string } = await prompt(inputQuestions);
    // const token = JSON.stringify(answers, null, '  ');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const token: string = answers.token;
    await axios
      .get<User>('https://qiita.com/api/v2/authenticated_user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const qiitaUser = {
          id: res.data.id,
          token: token,
        };
        const qiitaUserJson = JSON.stringify(qiitaUser, null, '  ');
        // 設定ファイル書き込み
        fs.writeFileSync(filePath, qiitaUserJson);
        fs.appendFileSync(filePath, '\n');
      });

    // 作業ディレクトリに記事用フォルダを作成
    const articleDir = 'articles';
    if (!fs.existsSync(articleDir)) {
      fs.mkdirSync(articleDir);
    }

    // 処理完了メッセージ
    console.log(
      '\n' +
        emoji.get('sparkles') +
        ' Access token initialize completed. ' +
        emoji.get('sparkles') +
        '\n'
    );
    console.log('Your token has been saved to the following path:');
    console.log('\n' + '\t' + filePath + '\n');
    console.log('Your articles folder:');
    console.log('\n' + '\t' + process.cwd() + '/articles/' + '\n');
    return 0;
  } catch (e) {
    const red = '\u001b[31m';
    const reset = '\u001b[0m';
    console.error(
      '\n' + red + 'error in get Qiita access token initialize: ' + reset + '\n'
    );
    console.error(e);
    return -1;
  }
  return 1;
}
