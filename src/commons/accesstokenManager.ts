import { createServer, Server, ServerResponse, IncomingMessage } from 'http';
import enableDestroy from 'server-destroy';
import { ReadonlyDeep } from 'type-fest';
import crypto from 'crypto';
import { getAccessToken } from './qiitaApis';
import open from 'open';
import { Answers, prompt, QuestionCollection } from 'inquirer';
import sleep from 'sleep-promise';

const qiitaOauthClientTokens = {
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
        response.setHeader('Content-Type', 'text/plain;charset=utf-8');
        response.end('codeの取得が完了しました。ブラウザを閉じてください');
      }
    );
  });
}

export async function oauthLogin(): Promise<string> {
  const server = await startLocalServer();
  // OAuth認可を行う時に
  const authorizeState = crypto.randomBytes(12).toString('hex');
  const permissionScope = [
    'read_qiita',
    'write_qiita',
    'read_qiita_team',
    'write_qiita_team',
  ].join('+');
  const qiitaAuthorizeUrl = `https://qiita.com/api/v2/oauth/authorize?client_id=${qiitaOauthClientTokens.clientId}&scope=${permissionScope}&state=${authorizeState}`;
  await open(qiitaAuthorizeUrl);
  const authCode = await recieveOauthCallbackCode(server).finally(() => {
    server.destroy();
  });
  const accessTokenResponse = await getAccessToken(
    qiitaOauthClientTokens.clientId,
    qiitaOauthClientTokens.clientSecret,
    authCode
  );
  return accessTokenResponse.data.token;
}

export async function inputAccessToken(): Promise<string> {
  console.log(
    'Qiitaの管理者画面にてアクセストークンを発行し、トークンを入力してください\n'
  );
  await sleep(1500);
  await open('https://qiita.com/settings/applications');
  // ユーザ入出力形式指定
  const inputTokenQuestions: QuestionCollection = [
    {
      type: 'input',
      message: 'Qiita AccessToken: ',
      name: 'token',
    },
  ];

  // ユーザ入力(prompt())
  const answers: Answers | { token: string } = await prompt(
    inputTokenQuestions
  );
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return answers.token.toString();
}
