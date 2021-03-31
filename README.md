# ts-sample

typescriptでのcli開発練習用

## usage

``` bash
# gitigoreはまとめて設定
curl https://raw.githubusercontent.com/github/gitignore/master/Node.gitignore > .gitignore

# 開発用に監視
npm run build
# VScode開発であればtask設定しているので、コマンドパレットからTasks: Run taskで実行可能#
# Ctrl + shift  + B でビルドタスクが立ち上がる

# プロジェクトに対してシンボリックリンクが貼られ、ローカルでglobal install した状態になり
# binに指定したキーコマンドでコマンド実行可能に
npm link
ts-sample 15

# lint
# .eslintignoreで設定用のjsを除外
# ビルド対象ではないがlint対象にはしたいので、lintようにtsconfig.eslint.jsonが存在する
npm run lint

# test
npm run test

```

## メモ

qiita api v2
<https://qiita.com/api/v2/docs>

記事投稿関連
<https://qiita.com/api/v2/docs#%E6%8A%95%E7%A8%BF>
記事更新
PATCH /api/v2/items/:item_id
記事作成
POST /api/v2/items

## 参考

これみながら調整中
<https://www.npmjs.com/package/ts-command-line-args>
typescriptでcli
<https://qiita.com/suzuki_sh/items/f3349efbfe1bdfc0c634>
<https://qiita.com/suzuki_sh/items/f3349efbfe1bdfc0c634>
<https://qiita.com/amay077/items/c19ab5304176326d584a>
Bearer認証とは
<https://qiita.com/h_tyokinuhata/items/ab8e0337085997be04b1>
