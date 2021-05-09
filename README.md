# qiita-cli

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

qiita記事管理用のTypeScript製cli

## 紹介記事

https://qiita.com/antyuntyuntyun/items/278579fd60ecd85f6e4c

## インストール

npmにpublishしているものからインストール
```bash
npm install qiita-cli
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

### node-emoji

emoji一覧
<https://raw.githubusercontent.com/omnidan/node-emoji/master/lib/emoji.json>

### VScodeによるホットロード

`.vscode/tasks.json` でwatch設定をしているので, Ctr + Shift + B でwatch状態に設定可能

## 参考

qiita api v2  
<https://qiita.com/api/v2/docs>  
cli作成参考記事  
<https://qiita.com/suzuki_sh/items/f3349efbfe1bdfc0c634>  
<https://qiita.com/amay077/items/c19ab5304176326d584a>  
