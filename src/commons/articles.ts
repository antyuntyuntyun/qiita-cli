import fs from 'fs';
import fg from 'fast-glob';
import matter, { GrayMatterFile } from 'gray-matter';
import { createHash } from 'crypto';
import { QiitaPost } from '~/types/qiita';
import { ArticleProperty } from '~/types/article';

export function loadArticleFiles(rootDir: string): string[] {
  return fg.sync([rootDir, '**', '*.md'].join('/'), { dot: true });
}

export function loadCurrentIdToArticle(
  rootDir: string
): { [articleId: string]: Article } {
  const currentIdFileArticles: { [articleId: string]: Article } = {};
  const allFiles = loadArticleFiles(rootDir);
  for (const filePath of allFiles) {
    const article = new Article(filePath);
    if (!article.isNew()) {
      const property = article.getProperty();
      if (property) {
        currentIdFileArticles[property.id] = article;
      }
    }
  }
  return currentIdFileArticles;
}

export function calcArticleHash(property: Partial<ArticleProperty>): string {
  return createHash('sha256')
    .update(property.body || '')
    .digest('hex');
}

export const defaultProjectName = 'articles';

export class Article {
  private filePath: string;
  private property: ArticleProperty | null = null;

  constructor(articleFilePath: string) {
    this.filePath = articleFilePath;
    if (fs.existsSync(articleFilePath)) {
      this.loadExistsFile();
    }
  }

  getProperty(): ArticleProperty | null {
    return this.property;
  }

  private loadExistsFile() {
    const matterMarkdown: GrayMatterFile<string> = matter(
      fs.readFileSync(this.filePath, 'utf-8')
    );
    this.property = {
      id: matterMarkdown.data.id,
      title: matterMarkdown.data.title,
      coediting: matterMarkdown.data.coediting,
      group_url_name: matterMarkdown.data.group_url_name,
      private: matterMarkdown.data.private,
      tags: matterMarkdown.data.tags,
      hash: matterMarkdown.data.hash,
      body: matterMarkdown.content,
    };
  }

  isNew(): boolean {
    if (this.property && this.property.id && this.property.id.length > 0) {
      return false;
    } else {
      return true;
    }
  }

  writeFileFromQiitaPost(qiitaPost: Partial<QiitaPost>): Promise<void> {
    const group_url_name = qiitaPost.group
      ? qiitaPost.group.url_name
      : undefined;
    const body = qiitaPost.body || '';
    const articleProparty: Partial<ArticleProperty> = {
      id: qiitaPost.id || '',
      title: qiitaPost.title || '',
      coediting: qiitaPost.coediting,
      group_url_name: group_url_name,
      private: qiitaPost.private,
      tags: (qiitaPost.tags || [{ name: 'qiita-cli' }]).map((tagObj) => {
        return { name: tagObj.name };
      }),
      url: qiitaPost.url,
      created_at: qiitaPost.created_at,
      updated_at: qiitaPost.updated_at,
      hash: calcArticleHash({ body: body }),
    };
    const matterProperty = Object.fromEntries(
      Object.entries(articleProparty).filter(
        ([key, value]) => value !== null && value != undefined
      )
    );
    const saveMarkdownFile = matter.stringify(body, matterProperty);
    // write frontMatter
    return fs.promises.writeFile(this.filePath, saveMarkdownFile);
  }
}
