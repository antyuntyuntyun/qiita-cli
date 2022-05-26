import fg from 'fast-glob';
import fs from 'fs';
import matter from 'gray-matter';
import { QiitaPost } from '~/types/qiita';

export function loadArticleFiles(rootDir: string): string[] {
  return fg.sync([rootDir, '**', '*.md'].join('/'), { dot: true });
}

export const defaultProjectName = 'articles';

export function writeFrontmatterMarkdownFileWithQiitaPost(
  filePath: string,
  qiitaPost: QiitaPost
) {
  const saveMarkdownFile = matter.stringify(qiitaPost.body, {
    id: qiitaPost.id,
    title: qiitaPost.title,
    created_at: qiitaPost.created_at,
    updated_at: qiitaPost.updated_at,
    tags: JSON.stringify(qiitaPost.tags),
    private: qiitaPost.private,
    url: qiitaPost.url,
    likes_count: qiitaPost.likes_count,
  });
  // write frontMatter
  fs.writeFileSync(filePath, saveMarkdownFile);
}
