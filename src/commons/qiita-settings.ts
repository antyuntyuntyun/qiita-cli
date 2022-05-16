import emoji from 'node-emoji';
import fs from 'fs';
import path from 'path';

export function loadInitializedAccessToken(): { token: string } | null {
  // アクセストークン情報をqiita.jsonから取得
  // qiita init で事前に設定されている必要あり
  const homeDir =
    process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME'] || '';
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  const qiitaDir = path.join(homeDir, '.qiita');
  const filePath = path.join(qiitaDir, 'qiita.json');
  if (!fs.existsSync(filePath)) {
    console.log(
      emoji.get('disappointed') + ' アクセストークンが設定されていません.\n'
    );
    console.log(
      'qiita init コマンドを実行してアクセストークンを設定してください.\n'
    );
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}
