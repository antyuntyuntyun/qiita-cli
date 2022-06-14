import fg from 'fast-glob';

export function loadArticleFiles(rootDir: string): string[] {
  return fg.sync([rootDir, '**', '*.md'].join('/'), { dot: true });
}
