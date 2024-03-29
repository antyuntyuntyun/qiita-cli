export interface commandLineArgs {
  command: string;
}

export interface ExtraInputOptions {
  token: string;
  project: string;
  file: string;
  all: boolean;
  tweet: boolean;
  simplify: boolean;
  overwrite: boolean;
}
