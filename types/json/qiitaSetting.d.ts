declare module '*/qiita.json' {
  interface qiitaSetting {
    token: string;
  }

  const value: qiitaSetting;
  export = value;
}
