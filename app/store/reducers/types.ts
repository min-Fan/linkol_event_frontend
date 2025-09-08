export interface Tag {
  /**
   * 子集
   */
  children: Child[];
  /**
   * 标签ID
   */
  id: number;
  /**
   * 这个标签下的所有KOL数量
   */
  kol_count: number;
  /**
   * 标签级别
   */
  level: number;
  /**
   * 标签名
   */
  name: string;
  /**
   * 父级
   */
  parent: null;
}

export interface Child {
  children: string[];
  id: number;
  kol_count: number;
  icon?: React.ReactNode;
  level: number;
  name: string;
  parent: number;
}

export interface Language {
  /**
   * 这个语言下所有KOL的数量
   */
  kol_count: number;
  /**
   * 语言
   */
  name: string;
}

export interface Tags {
  categories: Tag | null;
  chains: Tag | null;
  topic: Tag | null;
  languages: Language[];
}

export interface IConfig {
  platform_receive_address: string;
  tags: Tags;
}

export type Filter = {
  tags: number[];
  min_price: string;
  max_price: string;
  language: string[];
  kw: string;
  limit: number;
  is_verified: number;
  order: string;
};

export interface QuickOrder {
  order_no: string;
  order_id: string;
  project_id: string;
  promotional_materials: string;
  service_type_code: string;
}

export interface KOLInfo {
  ai_analysis?: string;
  created_at: string;
  followers: number;
  id: number;
  likes: number;
  listed: number;
  name: string;
  our_description: string[];
  screen_name: string;
  tweets: number;
  x_description: string;
  icon: string;
  tags: string[];
  profile_banner_url: string;
}
