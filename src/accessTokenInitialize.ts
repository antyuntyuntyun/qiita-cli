import axios from 'axios';
import fs from 'fs';
import emoji from 'node-emoji';
import open from 'open';
import { Answers, prompt, QuestionCollection } from 'inquirer';
import sleep from 'sleep-promise';
import { User } from '@/types/qiita';
import { initializeAndLoadQiitaDir } from './commons/qiitaSettings';
import { loadAuthenticatedUser, getAccessToken } from './commons/qiitaApis';
import { createServer, Server, ServerResponse, IncomingMessage } from 'http';
import { AddressInfo } from 'net';
import enableDestroy from 'server-destroy';
import { ReadonlyDeep } from 'type-fest';
import crypto from 'crypto';

const globalOauth2ClientSettings = {
  clientId: '7aca58a519a2d1cb83d8117d5d7a8210a3c2cd53',
  clientSecret: 'cb1d5595b9122742fc0e56d16610f2a93a3a8c11',
};

// Oauth認可を行う時に受け取るサーバのポート番号
const serverPortNumber = 59116;

async function startLocalServer(): Promise<Server> {
  return new Promise<Server>((resolve) => {
    const server = createServer();
    enableDestroy(server);
    server.listen(serverPortNumber, () => resolve(server));
  });
}

async function recieveOauthCallbackCode(server: Server): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    server.on(
      'request',
      (
        request: ReadonlyDeep<IncomingMessage>,
        response: ReadonlyDeep<ServerResponse>
      ) => {
        const urlParts = new URL(request.url ?? '', 'http://localhost')
          .searchParams;
        const code = urlParts.get('code');
        const error = urlParts.get('error');
        if (code) {
          resolve(code);
        } else {
          reject(error);
        }
        response.end('Logged in! You may close this page. ');
      }
    );
  });
}

export async function accessTokenInitialize(): Promise<number> {
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
    // OAuth認可を行う時に
    const authorizeState = crypto.randomBytes(12).toString('hex');
    const permissionScope = [
      'read_qiita',
      'write_qiita',
      'read_qiita_team',
      'write_qiita_team',
    ].join('+');
    const qiitaAuthorizeUrl = `https://qiita.com/api/v2/oauth/authorize?client_id=${globalOauth2ClientSettings.clientId}&scope=${permissionScope}&state=${authorizeState}`;
    const openBrowserPromise = open(qiitaAuthorizeUrl);
    //await open('https://qiita.com/settings/applications');

    const server = await startLocalServer();
    // { address: '::', family: 'IPv6', port: 50441 } のような形でportの値のみを取得する
    const { port } = server.address() as AddressInfo;
    await openBrowserPromise;
    const authCode = await recieveOauthCallbackCode(server).finally(() => {
      server.destroy();
    });
    const accessTokenResponse = await getAccessToken(
      globalOauth2ClientSettings.clientId,
      globalOauth2ClientSettings.clientSecret,
      authCode
    );

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
    const token = accessTokenResponse.data.token;
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
