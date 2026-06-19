export interface Resource {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  category: ResourceCategory;
  isFavorite: boolean;
  createdAt: string;
}

export type ResourceCategory =
  | 'article'
  | 'video'
  | 'course'
  | 'documentation'
  | 'tool'
  | 'other';
