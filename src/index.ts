import { accessTokenInitialize } from './accessTokenInitialize';
import { Calc } from './calc';
import emoji from 'node-emoji';
import { newArticle } from './newArticle';
import { pullArticle } from './pullArticle';
import packageJson from '../package.json';
import { postArticle } from './postArticle';
import { patchArticle } from './patchArticle';
import { program } from 'commander';
import { ExtraInputOptions } from '~/types/command';

const mainUsage: string = `Command:
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

/**
 * Set global CLI configurations
 */
program.storeOptionsAsProperties(false);

program.version(
  packageJson.version,
  '-v, --version',
  [
    emoji.get('hatched_chick') + 'qiita cli',
    'version:',
    packageJson.version,
  ].join(' ')
);

program.usage(mainUsage);

program.helpOption('-h, --help', 'ヘルプ');

program
  .command('init')
  .description('qiitaとの接続設定. 初回のみ実行')
  .action(async () => {
    await accessTokenInitialize();
  });

program
  .command('pull:article')
  .description('既に投稿している記事をローカルにpull(強制上書き)')
  .option(
    '-t, --token <accessToken>',
    'Qiitaで発行したaccessTokenを入力してください'
  )
  .action(async (options: ExtraInputOptions) => {
    await pullArticle(options);
  });

program
  .command('new:article')
  .description('新しい記事を追加')
  .action(async () => {
    await newArticle();
  });

program
  .command('post:article')
  .description('ローカルで新規作成した記事を選択的に投稿')
  .option(
    '-t, --token <accessToken>',
    'Qiitaで発行したaccessTokenを入力してください'
  )
  .action(async (options: ExtraInputOptions) => {
    await postArticle(options);
  });

program
  .command('patch:article')
  .description('ローカルで修正した記事を選択的に投稿')
  .option(
    '-t, --token <accessToken>',
    'Qiitaで発行したaccessTokenを入力してください'
  )
  .action(async (options: ExtraInputOptions) => {
    await patchArticle(options);
  });

program
  .command('sync')
  .description('ローカルで作成/修正した記事の一括反映および投稿済み記事の取得')
  .action(() => {
    new Calc().add(1, 2);
  });

program.parse(process.argv);
