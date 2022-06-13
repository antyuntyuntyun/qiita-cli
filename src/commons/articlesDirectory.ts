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
): Promise<void> {
  const group_url_name = qiitaPost.group ? qiitaPost.group.url_name : null;
  const saveMarkdownFile = matter.stringify(qiitaPost.body, {
    id: qiitaPost.id,
    title: qiitaPost.title,
    coediting: qiitaPost.coediting,
    group_url_name: group_url_name,
    created_at: qiitaPost.created_at,
    updated_at: qiitaPost.updated_at,
    tags: qiitaPost.tags.map((tagObj) => {
      return { name: tagObj.name };
    }),
    private: qiitaPost.private,
    url: qiitaPost.url,
    likes_count: qiitaPost.likes_count,
    hash: createHash('sha256').update(qiitaPost.body).digest('hex'),
  });
  // write frontMatter
  return fs.promises.writeFile(filePath, saveMarkdownFile);
}
