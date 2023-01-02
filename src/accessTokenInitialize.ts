import axios from 'axios';
import fs from 'fs';
import emoji from 'node-emoji';
import { Answers, prompt, QuestionCollection } from 'inquirer';
import sleep from 'sleep-promise';
import { initializeAndLoadQiitaDir } from './commons/qiitaSettings';
import { loadAuthenticatedUser } from './commons/qiitaApis';
import { oauthLogin } from './commons/accesstokenManager';
import { InitInputOptions } from '~/types/command';

export async function accessTokenInitialize(
  options: InitInputOptions
): Promise<number> {
  try {
    const filePath = initializeAndLoadQiitaDir();
    if (fs.existsSync(filePath)) {
      // ユーザ入出力形式指定
      const inputYesNoBoolQuestions: QuestionCollection = [
        {
          type: 'confirm',
          message:
            '設定ファイルが既に存在します。設定が上書きされますが、よろしいですか？: ',
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
    }

    console.log(
      'Qiitaの管理者画面にてアクセストークンを発行し、トークンを入力してください\n'
    );
    await sleep(1500);
    // 1.5 seconds later
    // open qiita admin by web default web browser
    //await open('https://qiita.com/settings/applications');

    /*
    // ユーザ入出力形式指定
    const inputTokenQuestions: QuestionCollection = [
      {
        type: 'input',
        message: 'Qiita AccessToken: ',
        name: 'token',
      },
    ];

    // ユーザ入力(prompt())
    // TODO: 入力されるアクセストークンをシェル上で非表示にする
    const answers: Answers | { token: string } = await prompt(
      inputTokenQuestions
    );
    // const token = JSON.stringify(answers, null, '  ');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const token: string = answers.token;
    */
    const token = await oauthLogin();
    const res = await loadAuthenticatedUser(token);
    const qiitaUser = {
      id: res.data.id,
      token: token,
    };
    const qiitaUserJson = JSON.stringify(qiitaUser, null, '  ');
    // 設定ファイル書き込み
    fs.writeFileSync(filePath, qiitaUserJson);
    fs.appendFileSync(filePath, '\n');

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
