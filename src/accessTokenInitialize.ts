import { AxiosError } from 'axios';
import fs from 'fs';
import emoji from 'node-emoji';
import { initializeAndLoadQiitaDir } from './commons/qiitaSettings';
import { loadAuthenticatedUser } from './commons/qiitaApis';
import { oauthLogin, inputAccessToken } from './commons/accessTokenManager';
import { InitInputOptions } from '@/types/command';

export async function accessTokenInitialize(
  options: InitInputOptions
): Promise<number> {
  try {
    const filePath = initializeAndLoadQiitaDir();
    let token = '';
    if (options.method === 'oauth') {
      token = await oauthLogin();
    } else {
      token = await inputAccessToken();
    }
    if (!token) {
      console.error('アクセストークンを取得できませんでした');
      return -1;
    }
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
    if (e.isAxiosError) {
      const axiosError = e as AxiosError;
      console.error(
        `status:${axiosError.response?.status} message:${axiosError.message}`
      );
    } else {
      console.error(`message:${e.message}`);
    }
    return -1;
  }
  return 1;
}
