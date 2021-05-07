import { accessTokenInitialize } from './accessTokenInitialize';
import { Calc } from './calc';
import { pullArticle } from './pullArticle';
import packageJson from '../package.json';

type CommandType =
  | string
  | 'init'
  | 'pull:article'
  | 'new:article'
  | 'sync'
  | 'version'
  | 'help';

class Main {
  // command-line-usageがエラーが出て使えないので以下の実装
  private readonly mainUsage: string = `  
🐥 qiita cli

Command:
  qiita init           qiitaとの接続設定. 初回のみ実行
  qiita pull:article   既に投稿している記事をローカルにpull
  qiita new:article    新しい記事を追加
  qiita post:article ローカルで作成した記事を投稿
  qiita sync           ローカルで作成/修正した記事を反映
  qiita --version, -v  qiita-cliのバージョンを表示
  qiita --help, -h     ヘルプ
`;

  private commandMap = new Map<CommandType, () => number | Promise<number>>([
    ['init', () => new accessTokenInitialize().exec()],
    ['pull:article', () => new pullArticle().exec()],
    ['new:article', () => new Calc().add(1, 2)],
    ['post:article', () => new Calc().add(1, 2)],
    ['sync', () => new Calc().add(1, 2)],
  ]);

  async run() {
    // command-line-usageを利用しようとすると以下エラーを吐いてしまう
    // TypeError: Cannot read property 'arrayify' of undefined
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
        console.log('\n🐥 qiita cli');
        console.log('version: ' + packageJson.version + '\n');
      } else {
        // other wrong args
        console.log('\n😞 wrong args\nfollow as below\n');
        console.log(this.mainUsage);
      }
      process.exit(1);
    }
  }
}

void new Main().run();
