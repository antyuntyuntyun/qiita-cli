import path from 'path';
import fg from 'fast-glob';

export function loadArticleFiles(rootDir: string): string[] {
  return fg.sync(path.join(rootDir, '**', '*.md'), { dot: true });
}
