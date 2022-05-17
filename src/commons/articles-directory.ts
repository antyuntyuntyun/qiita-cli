import fs from 'fs';
import path from 'path';

export function loadArticleFiles(rootDir: string): string[] {
  return fs
    .readdirSync(rootDir, { withFileTypes: true })
    .flatMap((dirent) =>
      dirent.isFile()
        ? [path.join(rootDir, dirent.name)]
        : loadArticleFiles(path.join(rootDir, dirent.name))
    );
}
