# qiita-cli

<p align="left">
  <a href="https://badge.fury.io/js/qiita-cli">
    <img src="https://badge.fury.io/js/qiita-cli.svg" alt="npm version" height="18">
  </a>
  <a>
    <img height="20"src="https://img.shields.io/npm/dt/qiita-cli.svg" alt="npm downloads" />
  </a>
  <a href="https://opensource.org/licenses/Apache-2.0">
    <img height="20" src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License Apache 2.0" />
  </a>
<p>

qiita記事管理用のTypeScript製cli

## 紹介記事

<https://qiita.com/antyuntyuntyun/items/278579fd60ecd85f6e4c>

## インストール

```bash
npm install qiita-cli
```

## How to use

```bash
$ qiita --help

🐥 qiita cli

Command:
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

```

## 開発環境設定

```bash
# node仮想環境の用意
# ※anyenv: https://github.com/anyenv/anyenv
nodenv install 14.16.0
# パッケージインストール
npm install
# ビルド
npm run build
# package.jsonのbin記載コマンド'qiita'が使えるように
# シンボリックリンクを生成
npm link
```

### VScodeによるホットロード

Ctr + Shift + B でwatch状態に設定可能(設定ファイル: `.vscode/tasks.json`)

## 参考

qiita api v2  
<https://qiita.com/api/v2/docs>  
cli作成参考記事  
<https://qiita.com/suzuki_sh/items/f3349efbfe1bdfc0c634>  
<https://qiita.com/amay077/items/c19ab5304176326d584a>  
node-emoji一覧
<https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json>
