# qiita-cli
qiita記事管理用のTypeScript製cli

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

## 参考

qiita api v2
<https://qiita.com/api/v2/docs>
cli作成参考記事
<https://qiita.com/suzuki_sh/items/f3349efbfe1bdfc0c634>
<https://qiita.com/amay077/items/c19ab5304176326d584a>

