import fs from 'fs';
import emoji from 'node-emoji';
import open from 'open';
import { prompt, QuestionCollection } from 'inquirer';
import sleep from 'sleep-promise';

export class accessTokenInitialize {
  async exec(): Promise<number> {
    try {
      // ここでアクセストークンを発行してもらって、それを入力で受け取りたい
      console.log(
        'qiitaの管理者画面にてアクセストークンを発行し、トークンをcliに入力してください\n'
      );
      await sleep(1500);
      // 2 seconds later
      // open iita admin by web default web browser
      await open('https://qiita.com/settings/applications');
      // user input
      const inputQuestions: QuestionCollection = [
        {
          type: 'input',
          message: 'Qiita AccessToken: ',
          name: 'token',
        },
      ];
      // unknown指定でlintエラー回避.
      // prmpt自体がunsafe callなのは以下ラインで対応
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const answers: unknown = await prompt(inputQuestions);
      const token = JSON.stringify(answers, null, '  ');
      const homeDir =
        process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'];
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      const qiitaDir = `${homeDir}/.qiita`;

      // ホームディレクトリにqiita設定ファイルを書き出し
      fs.mkdir(qiitaDir, (err) => {
        if (err) {
          console.log(err);
        }
      });
      const filePath = `${qiitaDir}/qiita.json`;
      fs.writeFileSync(filePath, token);
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
      console.error('error in get Qiita access token initialize: ');
      console.error(e);
      return -1;
    }
    return 1;
  }
}
