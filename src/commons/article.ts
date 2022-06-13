import fs from 'fs';
import matter, { GrayMatterFile } from 'gray-matter';
import { createHash } from 'crypto';
import { Tag, QiitaPost } from '~/types/qiita';

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
      title: matterMarkdown.data.string,
      coediting: matterMarkdown.data.coediting,
      group_url_name: matterMarkdown.data.group_url_name,
      private: matterMarkdown.data.private,
      tags: matterMarkdown.data.tags,
      hash: matterMarkdown.data.hash,
    };
  }

  isNew(): boolean {
    return this.property === null || this.property.id.length > 0;
  }

  writeFileFromQiitaPost(qiitaPost: QiitaPost): Promise<void> {
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
    return fs.promises.writeFile(this.filePath, saveMarkdownFile);
  }
}

interface ArticleProperty {
  id: string;
  title: string;
  private: boolean;
  coediting?: string;
  group_url_name?: string;
  tags: Tag[];
  created_at?: string;
  updated_at?: string;
  url?: string;
  likes_count?: number;
  hash: string;
}
