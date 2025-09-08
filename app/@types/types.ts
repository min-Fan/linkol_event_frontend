export interface KolRankListData {
  list: KolRankListItem[];
  /**
   * 总数
   */
  total: number;
  /**
   * 页码
   */
  page_range: number[];
  /**
   * 当前页码
   */
  current_page: number;
}

export interface KolRankListItem {
  icon?: string;
  /**
   * 关注人数
   */
  followers: number;
  id: number;
  /**
   * 语言
   */
  language: string;
  /**
   * 点赞
   */
  likes: number;
  /**
   * list数
   */
  listed: number;
  /**
   * @前面的名
   */
  name: string;
  /**
   * 编号
   */
  number: number;
  /**
   * 价格:分
   */
  price: number;
  /**
   * 价格:元
   */
  price_yuan: number;
  /**
   * icon
   */
  profile_image_url: string;
  /**
   * 项目
   */
  projects: ProjectItem[];
  /**
   * 雷达图数据
   */
  radar_chart: RadarChart;
  /**
   * 分数
   */
  score: number;
  /**
   * @后面的名
   */
  screen_name: string;
  /**
   * 标签
   */
  tags: string;
  /**
   * 推文数
   */
  tweets: number;
  /**
   * 互动率
   */
  interaction_rate: number;
  /**
   * 互动数
   */
  interaction_amount: number;
  /**
   * 曝光率
   */
  exposure_rate: number;
  /**
   * 预期曝光
   */
  expected_exposure: number;
  /**
   * cpm
   */
  cpm: number;
  /**
   * 是否已验证
   */
  is_verified: number;
}

export interface ProjectItem {
  icon: string;
  name: string;
}

/**
 * 雷达图数据
 */
export interface RadarChart {
  data: number[];
  indicator: Indicator[];
}

export interface Indicator {
  max: number;
  name: string;
}

export interface OrderDetailItem {
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * order item id，订单选项id
   */
  id: number;
  kol: KolRankListItem;
  /**
   * kol审核状态，可选值:pending,doing,finished,reject
   */
  kol_audit_status: string;
  /**
   * 单价(单位元)
   */
  price: number;
  /**
   * 购买数量，默认1
   */
  tweets: number;
}

export interface IOrderGainData {
  /**
   * 当前页号
   */
  current_page: number;
  list: IOrderGainListItem[];
  /**
   * 页码范围
   */
  page_range: number[];
  /**
   * 数据总数
   */
  total: number;
  /**
   * 总的likes
   */
  total_likes: number;
  /**
   * 总的replay
   */
  total_replay: number;
  /**
   * 总的repost
   */
  total_repost: number;
  /**
   * 总的views
   */
  total_views: number;
}

export interface IOrderGainListItem {
  /**
   * KOL的相关字段
   */
  kol: IOrderGainKol;
  /**
   * 点赞
   */
  likes: number;
  /**
   * 回复
   */
  replay: number;
  /**
   * 转发
   */
  repost: number;
  /**
   * 浏览
   */
  views: number;
}

/**
 * KOL的相关字段
 */
export interface IOrderGainKol {
  icon: string;
  name: string;
  screen_name: string;
}

export interface IProjectDetail {
  /**
   * 描述
   */
  desc: string;
  /**
   * 文档URL
   */
  document_urls: string[];
  /**
   * 项目logo
   */
  icon: string;
  /**
   * 项目id
   */
  id: string;
  /**
   * 项目名称
   */
  name: string;
  /**
   * 网站
   */
  website: string;
  tweet_url: string;
}
export interface PromotionData {
  order_amount: number;
  payment_amount: number;
  consumption_amount: number;
}

export interface MessageItem {
  /**
   * 发帖内容
   */
  content: string;
  /**
   * 发帖时间
   */
  created_at: string;
  /**
   * 关注数
   */
  followers: number;
  /**
   * kol对象
   */
  kol: KolObj;
  /**
   * kol评分
   */
  kol_score: number;
  /**
   * 点赞数
   */
  likes: number;
  medias: Media[];
  /**
   * 订单id
   */
  order_item_id: number;
  /**
   * 回复数
   */
  replays: number;
  /**
   * 转发数
   */
  reposts: number;
  /**
   * 任务类型
   */
  task_type: string;
  /**
   * 浏览数
   */
  views: number;
  /**
   * x推文id
   */
  x_id: string;
}

/**
 * kol对象
 *
 * kolObj
 */
export interface KolObj {
  /**
   * 关注人数
   */
  followers: number;
  /**
   * kol的id
   */
  id: number;
  /**
   * 语言
   */
  language: string;
  /**
   * 点赞
   */
  likes: number;
  /**
   * list数
   */
  listed: number;
  /**
   * @前面的名
   */
  name: string;
  /**
   * 编号
   */
  number: number;
  /**
   * 价格:分
   */
  price: number;
  /**
   * 价格:元
   */
  price_yuan: number;
  /**
   * icon
   */
  profile_image_url: string;
  /**
   * 项目
   */
  projects: string[];
  /**
   * 雷达图数据
   */
  radar_chart: RadarChart;
  /**
   * 分数
   */
  score: number;
  /**
   * @后面的名
   */
  user_name: string;
  /**
   * 标签
   */
  tags: string;
  /**
   * 推文数
   */
  tweets: number;
}

/**
 * 雷达图数据
 */
export interface RadarChart {
  data: number[];
  indicator: Indicator[];
}

export interface Indicator {
  max: number;
  name: string;
}

export interface Media {
  /**
   * 媒体url
   */
  media_url_https: string;
  /**
   * 媒体类型
   */
  type: string;
}

export interface IKOLHomeOrderListNoAuth {
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * 订单id
   */
  id: number;
  /**
   * kol统计数据
   */
  kol_data: KolTotal;
  /**
   * 项目信息
   */
  project: Project;
  /**
   * 推广结束时间
   */
  promotional_end_at?: string;
  /**
   * 宣传需求
   */
  promotional_materials: string;
  /**
   * 推广开始时间
   */
  promotional_start_at?: string;
  /**
   * 订单总金额
   */
  amount: number;
  /**
   * 订单剩余金额
   */
  remain_amount: number;
}

/**
 * kol统计数据
 */
export interface KolTotal {
  /**
   * kol接单数量
   */
  kol_accept_num: number;
  /**
   * kol头像列表
   */
  kol_icons: string[];
  /**
   * kol未接单数量
   */
  kol_no_accept_num: number;
  /**
   * kol总数
   */
  kol_num: number;
}

/**
 * 项目信息
 */
export interface Project {
  /**
   * 项目icon
   */
  icon?: string;
  /**
   * 项目id
   */
  id: number;
  /**
   * 项目名字
   */
  name: string;
}

export interface IKOLHomeOrderList {
  /**
   * 操作类型，接收:accept,抢单:vie,发推:post,已过期:expired
   */
  action_type?: string;
  /**
   * 订单信息
   */
  buy_agent_order: IBuyAgentOrder;
  /**
   * 创建时间
   */
  created_at: string;
  id: string;
  kol: IKol;
  /**
   * kol审核状态，可选值:pending,received,done
   */
  kol_audit_status: string;
  /**
   * 单价(单位元)
   */
  price: number;
  /**
   * 购买数量，默认1
   */
  tweets: number;

  //获得收益
  amount: number;
}

/**
 * 订单信息
 */
export interface IBuyAgentOrder {
  /**
   * 订单总金额
   */
  amount: number;
  /**
   * 订单id
   */
  id: number;
  /**
   * kol接单数量
   */
  kol_accept_num: number;
  /**
   * kol头像列表
   */
  kol_icons: string[];
  /**
   * kol未接单数量
   */
  kol_no_accept_num: number;
  /**
   * kol总数
   */
  kol_num: number;
  /**
   * 项目信息
   */
  project: IProject;
  /**
   * 推广结束时间
   */
  promotional_end_at?: string;
  /**
   * 宣传需求
   */
  promotional_materials: string;
  /**
   * 推广开始时间
   */
  promotional_start_at?: string;
  /**
   * 订单剩余金额
   */
  remain_amount: number;

  /**
   * 图片
   */
  medias: string[];
  ext_tweet_service_types: {
    code: string;
    name: {
      en: string;
      zh: string;
    };
  }[];
  tweet_service_type: {
    code: string;
    en: string;
    zh: string;
  };
}

/**
 * 项目信息
 */
export interface IProject {
  /**
   * 项目icon
   */
  icon?: string;
  /**
   * 项目id
   */
  id: number;
  /**
   * 项目名字
   */
  name: string;

  /**
   * 项目网站
   */
  website: string;

  /**
   * 项目描述
   */
  desc: string;
}

export interface IKol {
  /**
   * 描述
   */
  description: string;
  /**
   * 粉丝数
   */
  followers_count: number;
  /**
   * kol的id
   */
  id: number;
  /**
   * 获赞总量
   */
  like_count: number;
  /**
   * 列表收录数
   */
  listed_count: number;
  /**
   * 价格
   */
  price: number;
  /**
   * KOL名称
   */
  name: string;
  /**
   * 头像URL
   */
  profile_image_url: string;
  /**
   * 已购买kol的项目名字串，用逗号分隔
   */
  project_names?: string;
  /**
   * 标签，标签字符串用/分隔
   */
  tags?: string;
  /**
   * 推文总数
   */
  tweet_count: number;
  /**
   * 推特用户名
   */
  username: string;
  /**
   * 账号创建时间
   */
  x_created_at: string;
  /**
   * 背景图
   */
  profile_banner_url: string;
}

export interface IKolOrderDetail {
  /**
   * 操作类型，接收:accept,抢单:vie,发推:post,已过期:expired
   */
  action_type: string;

  agent_id: any;
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * order item id，订单选项id
   */
  id: number;
  kol: IKol;

  /**
   * kol审核状态，可选值:pending,doing,finished,reject
   */
  kol_audit_status: string;
  /**
   * 单价(单位元)
   */
  price: number;
  /**
   * 购买数量，默认1
   */
  tweets: number;

  buy_agent_order: IBuyAgentOrder;

  //订单金额
  amount: number;
}

export enum OrderPreviewType {
  POST_CONTENT = 'POST_CONTENT',
  POST_VIEW = 'POST_VIEW',
  POST_NONE = 'POST_NONE',
}
