export interface commandLineArgs {
  command: string;
}

type AccessTokenMethod = "oauth" | "input"

export interface InitInputOptions {
  method: AccessTokenMethod;
}

interface ProjectSettingInputOptions {
  project: string;
}

export interface PullArticleInputOptions extends ProjectSettingInputOptions {
  token: string;
}

export interface NewArticleInputOptions extends ProjectSettingInputOptions {
  simplify: boolean;
}

export interface PostArticleInputOptions extends ProjectSettingInputOptions {
  token: string;
  file: string;
  all: boolean;
  overwrite: boolean;
  tweet: boolean;
}