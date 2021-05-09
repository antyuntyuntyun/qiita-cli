import { accessTokenInitialize } from './accessTokenInitialize';
import { Calc } from './calc';
import emoji from 'node-emoji';
import { newArticle } from './newArticle';
import { pullArticle } from './pullArticle';
import packageJson from '../package.json';
import { postArticle } from './postArticle';
import { patchArticle } from './patchArticle';

type CommandType =
  | string
  | 'init'
  | 'pull:article'
  | 'new:article'
  | 'post:article'
  | 'patch:article'
  | 'delete:article'
  | 'sync'
  | 'version'
  | 'help';

class Main {
  // command-line-usageがエラーが出て使えないので以下の実装
  private readonly mainUsage: string = `Command:
  qiita init                    qiitaとの接続設定. 初回のみ実行
  qiita pull:article            既に投稿している記事をローカルにpull(強制上書き)
  qiita new:article             新しい記事を追加
  qiita post:article            ローカルで新規作成した記事を選択的に投稿
  qiita patch:article           ローカルで修正した記事を選択的に投稿
  qiita delete:article(未実装)   選択した記事の削除
  qiita sync(未実装)             ローカルで作成/修正した記事の一括反映および投稿済み記事の取得
  qiita --version, -v           qiita-cliのバージョンを表示
  qiita --help, -h              ヘルプ

Remark:
  コマンドは全て作業フォルダのルートでの実行を想定したものになっています.
  記事の取得・投稿は作業フォルダはコマンド実行場所の作業フォルダ内のarticlesフォルダを基準に実行されます.
  (articlesフォルダはqiita init や qiit pull コマンドで生成されます)
`;

  private commandMap = new Map<CommandType, () => number | Promise<number>>([
    ['init', () => new accessTokenInitialize().exec()],
    ['pull:article', () => new pullArticle().exec()],
    ['new:article', () => new newArticle().exec()],
    ['post:article', () => new postArticle().exec()],
    ['patch:article', () => new patchArticle().exec()],
    ['sync', () => new Calc().add(1, 2)],
  ]);

  async run() {
    // command-line-usageを利用しようとすると以下エラーを吐いてしまう
    // TypeError: Cannot read property 'arrayify' of undefined

    console.log('\n' + emoji.get('hatched_chick') + ' qiita cli\n');
    const exec = this.commandMap.get(process.argv[2]);
    if (exec != null) {
      const ret = await exec();
      // TODO:Promise<numberの対応>
      process.exit(ret);
    } else {
      if (process.argv[2] === '--help' || process.argv[2] === '-h') {
        // help
        console.log(this.mainUsage);
      } else if (process.argv[2] === '--version' || process.argv[2] === '-v') {
        // version
        console.log('\n' + emoji.get('hatched_chick') + 'qiita cli');
        console.log('version: ' + packageJson.version + '\n');
      } else {
        // other wrong args
        console.log(
          '\n' + emoji.get('disappointed') + ' wrong args\nfollow as below\n'
        );
        console.log(this.mainUsage);
      }
      process.exit(1);
    }
  }
}

void new Main().run();
