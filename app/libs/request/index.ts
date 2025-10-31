import { CACHE_KEY, EndPointURL } from '@constants/app';
import request from './request';
import kolRequest from './kol-request';

export const ENDPOINT_URL = {
  OTP_CODE: '/kol/api/v1/email/code',
  LOGIN: '/kol/api/v1/login',
  REGISTER: '/kol/api/v1/wallet/register',
  RESET_PASSWORD: '/kol/api/v1/user/resetpwd',
  BIND_WALLET: '/kol/api/v1/wallet/bind/',
  GET_INFO_BY_TOKEN: '/kol/api/v1/get_info_by_token/',
  NONCE: '/kol/api/v1/wallet/nonce/',
  BIND_EMAIL: '/kol/api/v1/bind/email/',
  UNBIND_EMAIL: '/kol/api/v1/unbind/email/',
  TAGS: '/kol/api/v1/tags/',
  GET_KOL: '/kol/api/v1/kols/by/tags/',
  PLATFORM_WALLET: '/kol/api/v1/platform/wallet/receive/address',
  CREATE_ORDER: '/kol/api/v1/agent/order',
  CREATE_ORDER_V2: '/kol/api/v2/agent/order',
  PAY_ORDER: '/kol/api/v1/agent/pay',
  PAY_ORDER_V2: '/kol/api/v2/agent/pay',
  CREATE_PROJECT: '/kol/api/v1/projects/',
  UPLOAD_DOC: '/kol/api/v1/doc_upload/',
  UPLOAD_IMAGE: '/kol/api/v2/upload/image/',
  GET_TWEET_TYPE_AND_ADD_ON_SERVICE: '/kol/api/v2/tweet_service_types',
  ASSOCIATE_PROJECT: '/kol/api/v1/business/order/project/bind',
  ORDER_LIST: '/kol/api/v1/business/order/list',
  ORDER_DETAIL: '/kol/api/v1/business/order/detail',
  ORDER_GAIN: '/kol/api/v1/order/gain/',
  WITHDRAW_ORDER_AMOUNT: '/kol/api/v1/business/order/withdraw',
  GET_KOL_INFO: '/kol/api/v1/kols/',
  PROJECT_LIST: '/kol/api/v1/projects/',
  PROJECT_DETAIL: '/kol/api/v1/projects/',
  PROJECT_UPDATE: '/kol/api/v1/projects/',
  ADVERTISER_MESSAGES: '/kol/api/v1/advertiser/msglist',
  RATE_KOL: '/kol/api/v1/order/item/evaluate/',
  GET_TEST_TOKEN: '/kol/api/v1/platform/wallet/receive/token',
  KOL_LIST_LINE_CHART: '/kol/api/v1/kol/line',
  TWITTER_AUTH_URL: '/kol/api/v1/kol/x/authorization',
  TWITTER_AUTH_CALLBACK: '/kol/api/v1/x/get_access_token/',
  TWITTER_AUTH_USER_INFO: '/kol/api/v1/x/profile/',
  TWITTER_AUTH_COMPLETE_CALLBACK: '/kol/api/v1/x/kol/login',
  TWITTER_AUTH_V2_URL: '/kol/api/v1/kol/x/2/authorization',
  TWITTER_AUTH_V2_CALLBACK: '/kol/api/v1/x/2/get_access_token/',
  TWITTER_AUTH_V2_USER_INFO: '/kol/api/v1/x/2/profile/',
  TWITTER_AUTH_V2_COMPLETE_CALLBACK: '/kol/api/v1/x/2/kol/login/',
  PLATFORM_TOTAL_RECHARGE_AND_TOTAL_DEAL: '/kol/api/v1/order/statistics',
  KOL_HOME_ORDER_LIST: '/kol/api/v2/kol/order/newlist',
  KOL_USER_INFO: '/kol/api/v1/user/x/info/',
  KOL_MESSAGES: '/kol/api/v1/platform/msg',
  KOL_ORDER_NO_AUTH_LIST: '/kol/api/v1/kol/order/noauth/newlist',
  KOL_TAKE_ORDER: '/kol/api/v2/kol/order/take',
  KOL_TAKE_ORDER_LIST: '/kol/api/v1/order/acceptances',
  KOL_ORDER_DETAIL: '/kol/api/v2/kol/order/detail',
  KOL_GET_TWEETS: '/kol/api/v2/submit/tweets/',
  KOL_VERIFY_TWEETS: '/kol/api/v1/verify/tweets/',
  KOL_GET_TWEET_CONTENT: '/kol/api/v2/tweets/content/gen',
  KOL_SNED_POST: '/kol/api/v2/x/2/tweets/post',
  KOL_GET_TWEET_BY_ORDER: '/kol/api/v2/order/tweet/',
  KOL_GET_VERIFY_TWEET: '/kol/api/v1/get/verify/tweet/',
  KOL_VERIFY_TWEET: '/kol/api/v1/verify/login/',
  KOL_GET_PROBLEM_CATEGORY: '/kol/api/v1/feedback/class/',
  KOL_SUBMIT_FEEDBACK: '/kol/api/v1/feedback/',
  KOL_INCOME: '/kol/api/v1/kol/income',
  KOL_WITHDRAW_SIGNATURE: '/kol/api/v1/withdraw/sign/',
  KOL_VERIFY_IS_NEED_LOGIN: '/kol/api/v1/auth/2/check/',
  LADINGPAGE_GET_KOL_LIST: '/kol/api/v1/good/kols/',
  LADINGPAGE_GET_LAST_CONTENT: '/kol/api/v1/latest/orders/',
  LADINGPAGE_GET_STATISTICS: '/kol/api/v1/landingpage/statistics/',
  KOL_CHAT: '/kol/api/v1/ai/chat/',
  KOL_GET_ORDER_UNCONSUMED_AMOUNT_SIGNATURE: '/kol/api/v1/project/withdraw/sign/',
  ORDER_CONTENT_GEN: '/kol/api/v2/tweets/no_order/content/gen',
  GET_TWEET_INFO_BY_URL: '/kol/api/v2/project/tweet_user_info',
  GET_KOL_DETAIL_BY_USERNAME: '/kol/api/v2/kol/detail',
  BRANDING_GET_PROJECT_INFO: '/kol/api/v2/banding/project/info',
  BRANDING_PAYMENT_PROCESSED: '/kol/api/v2/contract/paymentProcessed',
  BRANDING_REDEEMED: '/kol/api/v2/contract/redeemed',
  CREATE_ACTIVITY: '/kol/api/v3/actives/',
  GET_ACTIVITY_TYPE: '/kol/api/v3/active/types/',
  GET_REWARD_RULE: '/kol/api/v3/reward/rules/',
  CREATE_ACTIVITY_CALLBACK: '/kol/api/v3/active/create/pay/',
  CREATE_ACTIVITY_CALLBACK_REWARD: '/kol/api/v6/claim_reward/success/',
  SOLANA_CLAIM_REWARD: '/kol/api/v6/claim_reward/usd1/pay/',
  UPDATE_ACTIVITY: '/kol/api/v3/actives/',
  GET_PRICE: '/kol/api/v4/price/',
};

// 获取OTP码
interface IGetOtpCodeParams {
  email: string;
  code_type?: 'register' | 'reset_password';
}

interface IGetOtpCodeResponseData {
  result: string;
}

export const getOtpCode = (params: IGetOtpCodeParams) => {
  return request.get<IGetOtpCodeResponseData>(ENDPOINT_URL.OTP_CODE, { ...params });
};

interface ILoginParams {
  email: string;
  password: string;
}

interface ILoginResponseData {
  description: string | null;
  is_x_authorizationed: boolean;
  member_id: number;
  member_name: string;
  profile_image_url: string;
  screen_name: string;
  token: string;
  username: string;
  id: number;
  identity: string;
  email: string;
}

// 登录
export const login = (params: ILoginParams) => {
  return request.post<ILoginResponseData>(ENDPOINT_URL.LOGIN, { ...params });
};

interface IRegisterParams {
  nonce: string;
  wallet: string;
  signature: string;
  email: string;
  password: string;
  code: string;
}

interface IRegisterResponseData {
  id: number;
  username: string;
  email: string;
  identity: string;
  token: string;
}

// 注册
export const register = (params: IRegisterParams) => {
  return request.post<IRegisterResponseData>(ENDPOINT_URL.REGISTER, { ...params });
};

interface IResetPasswordParams {
  email: string;
  password: string;
  code: string;
}

interface IResetPasswordResponseData {
  id: number;
  username: string;
  email: string | null;
  token: string;
}

// 重置密码
export const resetPassword = (params: IResetPasswordParams) => {
  return request.post<IResetPasswordResponseData>(ENDPOINT_URL.RESET_PASSWORD, { ...params });
};

// 绑定钱包地址
interface IBindWalletParams {
  wallet: string;
  signature: string;
  nonce: string;
}

interface IBindWalletResponseData {
  id: number;
  username: string;
  email: string;
  identity: string;
  token: string;
}

export const bindWallet = (params: IBindWalletParams) => {
  return request.post<IBindWalletResponseData>(ENDPOINT_URL.BIND_WALLET, { ...params });
};

// 获取用户信息
export interface IGetInfoByTokenResponseData {
  id: number;
  username: string;
  email: string;
  identity: string;
  wallet_address: string;
  token: string;
}

export const getInfoByToken = () => {
  return request.get<IGetInfoByTokenResponseData>(ENDPOINT_URL.GET_INFO_BY_TOKEN);
};

// 绑定钱包地址的时候 获取nonce
interface IGetNonceParams {
  wallet: string;
}

interface IGetNonceResponseData {
  nonce: string;
}

export const getNonce = (params: IGetNonceParams) => {
  return request.get<IGetNonceResponseData>(ENDPOINT_URL.NONCE, { ...params });
};

// 绑定邮箱
interface IBindEmailParams {
  email: string;
  code: string;
}

export const bindEmail = (params: IBindEmailParams, kol?: boolean) => {
  if (kol) {
    return kolRequest.post(ENDPOINT_URL.BIND_EMAIL, { ...params });
  }
  return request.post(ENDPOINT_URL.BIND_EMAIL, { ...params });
};

// 解绑邮箱
interface IUnbindEmailParams {
  email: string;
  code: string;
}

export const unbindEmail = (params: IUnbindEmailParams, kol?: boolean) => {
  if (kol) {
    return kolRequest.post(ENDPOINT_URL.UNBIND_EMAIL, { ...params });
  }
  return request.post(ENDPOINT_URL.UNBIND_EMAIL, { ...params });
};

// 获取所有的tag
export const getTags = () => {
  return request.get(ENDPOINT_URL.TAGS);
};

// 获取KOL，根据tag和搜索关键字
export const getKol = (params: any) => {
  return request.get(ENDPOINT_URL.GET_KOL, { ...params });
};

// 查询平台接收钱包地址
export const getPlatformWallet = () => {
  return request.get(ENDPOINT_URL.PLATFORM_WALLET);
};

// 获取推文类型和增值服务
export const getTweetTypeAndAddOnService = () => {
  return request.get(ENDPOINT_URL.GET_TWEET_TYPE_AND_ADD_ON_SERVICE);
};

// 购买agent下单接口
export const createOrder = (params: any) => {
  return request.post(ENDPOINT_URL.CREATE_ORDER, { ...params });
};
// 购买agent下单接口 v2
export const createOrderV2 = (params: any) => {
  return request.post(ENDPOINT_URL.CREATE_ORDER_V2, { ...params });
};

// 上传图片(一次只能传一个图片) 最大5兆
interface IUploadImageRequest {
  file: File;
}

export const uploadImage = (params: IUploadImageRequest) => {
  return request.post(
    ENDPOINT_URL.UPLOAD_IMAGE,
    { ...params },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

// 购买agent支付接口
export const payOrder = (params: any) => {
  return request.post(ENDPOINT_URL.PAY_ORDER, { ...params });
};

// 购买agent支付接口 v2
export const payOrderV2 = (params: any) => {
  return request.post(ENDPOINT_URL.PAY_ORDER_V2, { ...params });
};

interface ICreateProjectRequest {
  desc?: string;
  document_urls?: string[];
  name?: string;
  website?: string;
  icon?: string;
  tweet_url?: string;
  discord_url?: string;
  telegram_url?: string;
}
// 创建project
export const createProject = (params: ICreateProjectRequest) => {
  return request.post(ENDPOINT_URL.CREATE_PROJECT, { ...params });
};

// 上传文档
interface IUploadDocRequest {
  file: File;
}

export const uploadDoc = (params: IUploadDocRequest) => {
  return request.post(
    ENDPOINT_URL.UPLOAD_DOC,
    { ...params },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
};

// 订单关联project_id接口
export interface IAssociateProjectParams {
  /**
   * 订单ID
   */
  order_id: number;
  /**
   * kol审核状态
   */
  project_id: number;
}

export const associateProject = (params: IAssociateProjectParams) => {
  return request.post(ENDPOINT_URL.ASSOCIATE_PROJECT, { ...params });
};

// 订单列表接口
export interface IOrderListParams {
  /**
   * 每页数量
   */
  limit?: number;
  /**
   * 页码
   */
  page?: number;
}

export interface IOrderListItem {
  consumption_amount: number;
  created_at: string;
  id: number;
  kol_agree_count: number;
  kol_count: number;
  order_amount: number;
  payment_amount: number;
  project_name: string;
  /**
   * 推广开始时间
   */
  promotional_start_at: string;
  /**
   * 推广结束时间
   */
  promotional_end_at: string;
}

export interface IOrderListResponseData {
  order_list: IOrderListItem[];
  total: number;
  page_range: number[];
  current_page: number;
}

export const getOrderList = (params: IOrderListParams) => {
  return request.get<IOrderListResponseData>(ENDPOINT_URL.ORDER_LIST, { ...params });
};

// 订单详情接口
export enum KOL_AUDIT_STATUS {
  ALL = '',
  PENDING = 'pending',
  DOING = 'doing',
  FINISHED = 'finished',
  REJECT = 'reject',
}

export interface IOrderDetailParams {
  /**
   * kol审核状态 可选:pending,doing,finished,reject,不传查全部
   */
  kol_audit_status?: KOL_AUDIT_STATUS;
  /**
   * 订单id
   */
  order_id: number;
}

export const getOrderDetail = (params: IOrderDetailParams) => {
  return request.get(ENDPOINT_URL.ORDER_DETAIL, { ...params });
};

// 订单的order的gain
export interface IOrderGainParams {
  order_id?: string;
  page?: number;
  size?: number;
}

export const getOrderGain = (params: IOrderGainParams) => {
  return request.get(ENDPOINT_URL.ORDER_GAIN, { ...params });
};

// 提取订单未消费金额接口
export interface IWithdrawOrderAmountParams {
  /**
   * 订单ID
   */
  order_id: number;
  /**
   * 商户钱包地址
   */
  wallet_address: string;
}
export const withdrawOrderAmount = (params: IWithdrawOrderAmountParams) => {
  return request.post(ENDPOINT_URL.WITHDRAW_ORDER_AMOUNT, { ...params });
};

// 获取某个KOL介绍和信息
export interface IGetKOLInfoParams {
  language?: string;
}

export const getKOLInfo = (id: string, params: IGetKOLInfoParams) => {
  return request.get(ENDPOINT_URL.GET_KOL_INFO + id, { ...params });
};

// project列表
export interface IProjectListData {
  /**
   * 创建时间
   */
  created_at: string;
  /**
   * 描述
   */
  desc: string;
  /**
   * 文档URL
   */
  document_urls: string[] | null;
  /**
   * 图片
   */
  icon: string;
  id: number;
  /**
   * 名字
   */
  name: string;
  user: number;
  /**
   * 网址
   */
  website: string;
}
export const getProjectList = (params: any) => {
  return request.get(ENDPOINT_URL.PROJECT_LIST, { ...params });
};

// 获取project 详情
export const getProjectDetail = (id: number) => {
  return request.get(ENDPOINT_URL.PROJECT_DETAIL + id);
};

// 修改项目
export interface IUpdateProjectParams {
  desc: string;
  document_urls: string[];
  /**
   * 图片URL
   */
  icon: string;
  name: string;
  /**
   * 网址
   */
  website: string;
  tweet_url: string;
}

export const updateProject = (id: number, params: IUpdateProjectParams) => {
  return request.put(ENDPOINT_URL.PROJECT_UPDATE + id + '/', { ...params });
};

// 删除项目
export const deleteProject = (id: number) => {
  return request.delete(ENDPOINT_URL.PROJECT_UPDATE + id + '/');
};

// 获取广告商消息
export interface IAdvertiserMessagesParams {
  page?: number;
  limit?: number;
}
export const getAdvertiserMessages = (params: IAdvertiserMessagesParams) => {
  return request.get(ENDPOINT_URL.ADVERTISER_MESSAGES, { ...params });
};

// 给订单对应的KOL评价
export interface IRateKOLParams {
  /**
   * 订单详情id
   */
  order_item_id: string;
  /**
   * 分数
   */
  score: string;
}
export const rateKOL = (params: IRateKOLParams) => {
  return request.post(ENDPOINT_URL.RATE_KOL, { ...params });
};

// 领取测试币UDT接口
export interface IGetUdtTokenParams {
  /**
   * 钱包地址
   */
  wallet_address: string;
}
export const getUdtToken = (params: IGetUdtTokenParams) => {
  return request.post(ENDPOINT_URL.GET_TEST_TOKEN, { ...params });
};

// kol列表的折线图和价格排名
export interface IGetKOLListLineChartParams {
  /**
   * 钱包地址
   */
  kol_id: string;
}
export const getKOLListLineChart = (params: IGetKOLListLineChartParams) => {
  return request.get(ENDPOINT_URL.KOL_LIST_LINE_CHART, { ...params });
};

// 步骤1.推特授权 URL
export interface IGetTwitterAuthUrlParams {
  call_back_url: string;
}
export interface IGetTwitterAuthUrlResponseData {
  agent_id: string;
  app_id: string;
  /**
   * 用于授权的URL 前端需要跳转
   */
  authorization_url: string;
  oauth_token: string;
  oauth_token_secret: string;
}
export const getTwitterAuthUrl = (params: IGetTwitterAuthUrlParams) => {
  return kolRequest.get<IGetTwitterAuthUrlResponseData>(ENDPOINT_URL.TWITTER_AUTH_URL, {
    ...params,
  });
};

// 步骤2.回调页面调用
export interface IGetTwitterAuthCallbackParams {
  oauth_token: string;
  oauth_token_secret: string;
  oauth_verifier: string;
  app_id: string;
}
export const getTwitterAuthCallback = (params: IGetTwitterAuthCallbackParams) => {
  return kolRequest.post(ENDPOINT_URL.TWITTER_AUTH_CALLBACK, { ...params });
};

// 步骤3.获取推特授权后的用户信息
export interface IGetTwitterAuthUserInfoParams {
  access_token: string;
  access_token_secret: string;
  app_id: string;
}
export const getTwitterAuthUserInfo = (params: IGetTwitterAuthUserInfoParams) => {
  return kolRequest.get(ENDPOINT_URL.TWITTER_AUTH_USER_INFO, { ...params });
};

// 步骤4.推特授权回调
export interface IGetTwitterAuthCompleteCallbackParams {
  /**
   * 认证URL接口中返回的app_id
   */
  app_id: string | number;
  /**
   * 接口3中返回的description
   */
  description: string;
  /**
   * 接口3中返回的oauth_token
   */
  oauth_token: string;
  /**
   * 接口3中返回的oauth_token_secret
   */
  oauth_token_secret: string;
  /**
   * "获取推特授权后的用户信息"接口返回的字段
   */
  profile_image_url_https: string;
  /**
   * 用户信息screen_name字段
   */
  screen_name: string;
  /**
   * 推特ID
   */
  user_id: string;
}
export const getTwitterAuthCompleteCallback = (params: IGetTwitterAuthCompleteCallbackParams) => {
  return kolRequest.post(ENDPOINT_URL.TWITTER_AUTH_COMPLETE_CALLBACK, { ...params });
};

// 平台总充值和总成交的统计数据
export const getPlatformTotalRechargeAndTotalDeal = () => {
  return request.get(ENDPOINT_URL.PLATFORM_TOTAL_RECHARGE_AND_TOTAL_DEAL);
};

// 获取KOL首页订单列表
export interface IGetKOLHomeOrderListParams {
  /**
   * kol审核状态 可选:pending,doing,finished,reject,canceled,不传查全部
   */
  kol_audit_status?: string;
  /**
   * kol_id 可选参数
   */
  kol_id?: number;
  /**
   * 订单类型  在线:online 过期：expired
   */
  order_type?: string;
  /**
   * 页码
   */
  page: number;
  /**
   * 每页数量
   */
  size: number;
}
export const getKOLHomeOrderList = (params: IGetKOLHomeOrderListParams) => {
  return kolRequest.get(ENDPOINT_URL.KOL_HOME_ORDER_LIST, { ...params });
};

// 根据token获取kol用户信息
export const getKOLUserInfo = () => {
  return kolRequest.get(ENDPOINT_URL.KOL_USER_INFO);
};

// kol查询平台消息
export interface IGetKolMessagesListParams {
  /**
   * 消息类型 kol_completed,project_paid
   */
  msg_type?: string;
  /**
   * 每页数量
   */
  limit?: number;
}
export const getKolMessagesList = (params: IGetKolMessagesListParams) => {
  return kolRequest.get(ENDPOINT_URL.KOL_MESSAGES, { ...params });
};

// 获取未授权的订单列表
export const getKolOrderNoAuthList = (params: IGetKOLHomeOrderListParams) => {
  return kolRequest.get(ENDPOINT_URL.KOL_ORDER_NO_AUTH_LIST, { ...params });
};

// kol接单抢单接口
export interface IKolTakeOrderParams {
  /**
   * 操作说明，抢单:vie, 接单take
   */
  action_type: 'vie' | 'take';
  /**
   * 订单选项id
   */
  order_item_id: number;
}

export const kolTakeOrder = (params: IKolTakeOrderParams) => {
  return kolRequest.post(ENDPOINT_URL.KOL_TAKE_ORDER, { ...params });
};

// 获取kol接单抢单列表
export interface IGetKolTakeOrderListParams {
  order_id: string;
}
export interface IGetKolTakeOrderListResponse {
  /**
   * 该订单下的所有有关KOL
   */
  kols: ITakeOrderListKol[];
  /**
   * 剩余钱数
   */
  remain_balance: number;
  /**
   * 总钱数
   */
  total: number;
}

export interface ITakeOrderListKol {
  /**
   * kol id
   */
  id: string;
  /**
   * @前面的名字
   */
  name: string;
  /**
   * 价格
   */
  price: number;
  /**
   * KOL头像
   */
  profile_image_url: string;
  /**
   * @后面的名字
   */
  screen_name: string;
  /**
   * 状态
   */
  status: string;
}
export const getKolTakeOrderList = (params: IGetKolTakeOrderListParams) => {
  return kolRequest.get(ENDPOINT_URL.KOL_TAKE_ORDER_LIST, { ...params });
};

//获取订单详情
export const getKOLOrderDetail = (params: { order_item_id: any }) => {
  return kolRequest.get(ENDPOINT_URL.KOL_ORDER_DETAIL, { ...params });
};

// 通过推文ID获取推文
export const getPostDetail = (params: any) => {
  return kolRequest.post(ENDPOINT_URL.KOL_GET_TWEETS, { ...params });
};

// 推文相关性检查
export const checkPostRelevance = (params: any) => {
  return kolRequest.post(ENDPOINT_URL.KOL_VERIFY_TWEETS, { ...params });
};

// 生成推文内容
export const generatePostContent = (params: any) => {
  return kolRequest.post(ENDPOINT_URL.KOL_GET_TWEET_CONTENT, {
    ...params,
  });
};

//发送推文
export const sendPost = (params: any) => {
  return kolRequest.post(ENDPOINT_URL.KOL_SNED_POST, { ...params });
};

//上传推文链接
export async function uploadSelfPostLink(params: any) {
  return kolRequest.post('/kol/api/v1/submit/tweets/', { ...params });
}

export const getTweetByOrderId = (params: any) => {
  return kolRequest.get(ENDPOINT_URL.KOL_GET_TWEET_BY_ORDER, { ...params });
};

//kol 提现
export async function getWithdraw(params: any) {
  return kolRequest.post('/kol/api/v1/kol/withdraw', { ...params });
}

// V2步骤1.推特授权 URL
export interface IGetTwitterAuthUrlParams {
  call_back_url: string;
}
export const getTwitterAuthUrlV2 = (params: IGetTwitterAuthUrlParams) => {
  return kolRequest.get(ENDPOINT_URL.TWITTER_AUTH_V2_URL, { ...params });
};

// V2步骤2.回调页面调用
export interface IGetTwitterAuthCallbackV2Params {
  code: string;
  x_id: string;
  call_back_url: string;
}
export const getTwitterAuthCallbackV2 = (params: IGetTwitterAuthCallbackV2Params) => {
  return kolRequest.get(ENDPOINT_URL.TWITTER_AUTH_V2_CALLBACK, { ...params });
};

// V2步骤3.获取推特授权后的用户信息
export interface IGetTwitterAuthUserInfoV2Params {
  access_token: string;
  x_id: string;
}
export const getTwitterAuthUserInfoV2 = (params: IGetTwitterAuthUserInfoV2Params) => {
  return kolRequest.get(ENDPOINT_URL.TWITTER_AUTH_V2_USER_INFO, { ...params });
};

// V2步骤4.推特授权回调
export interface IGetTwitterAuthCompleteCallbackV2Params {
  /**
   * 接口3中返回的access_token
   */
  access_token: string;
  /**
   * 接口3中返回的description
   */
  description: string;
  /**
   * 接口3中返回的expires_in
   */
  expires_in: string;
  /**
   * "获取推特授权后的用户信息"接口返回的字段
   */
  profile_image_url_https: string;
  /**
   * 接口3中返回的refresh_token
   */
  refresh_token: string;
  /**
   * 第3步返回的username
   */
  screen_name: string;
  /**
   * 第3步返回的id字段
   */
  user_id: string;
  /**
   * 第一步返回的
   */
  x_id: string;
  /**
   * 第3步返回的name字段
   */
  name: string;
  /**
   * 第三步返回的
   */
  verified: boolean;
  /**
   * 第三步返回的
   */
  verified_type: string;
  /**
   * 邀请码
   */
  invite_code: string;
  /**
   * 创建时间
   */
  created_at: string;
}
export const getTwitterAuthCompleteCallbackV2 = (
  params: IGetTwitterAuthCompleteCallbackV2Params
) => {
  return kolRequest.post(ENDPOINT_URL.TWITTER_AUTH_V2_COMPLETE_CALLBACK, { ...params });
};

export const getVerifyTweet = () => {
  return kolRequest.get(ENDPOINT_URL.KOL_GET_VERIFY_TWEET);
};

// 通过screen_name获取登录信息
export interface IGetTwitterAuthByUsernameOrLinkParams {
  screen_name: string;
}
export const getTwitterAuthByUsernameOrLink = (params: IGetTwitterAuthByUsernameOrLinkParams) => {
  return request.post('/kol/api/v1/x/2/kol/login/screen_name/', { ...params });
};

interface IVerifyTweetParams {
  tweet_url: string;
}

interface IVerifyTweetResponseData {
  description: string;
  email: string | null;
  id: number;
  identity: string;
  is_verified_2: boolean;
  profile_image_url: string;
  screen_name: string;
  token: string;
  username: string;
}

export const verifyTweet = (params: IVerifyTweetParams) => {
  return kolRequest.post<IVerifyTweetResponseData>(ENDPOINT_URL.KOL_VERIFY_TWEET, { ...params });
};

// 获取问题分类
export const getProblemCategory = () => {
  return kolRequest.get(ENDPOINT_URL.KOL_GET_PROBLEM_CATEGORY);
};

// 提交反馈
export interface ISubmitFeedbackParams {
  /**
   * 分类ID
   */
  class_id: number;
  /**
   * 问题反馈
   */
  content?: string;
  /**
   * 邮箱
   */
  email?: string;
  /**
   * kol id
   */
  kol_id: number;
  /**
   * 价格，用户输入
   */
  price?: number;
  /**
   * 分数
   */
  score?: number;
  /**
   * tag列表
   */
  tags?: number[];
}
export const submitFeedback = (params: ISubmitFeedbackParams) => {
  return kolRequest.post(ENDPOINT_URL.KOL_SUBMIT_FEEDBACK, { ...params });
};

// 统计kol收入接口
export const getKolIncome = () => {
  return kolRequest.get(ENDPOINT_URL.KOL_INCOME);
};

// KOL订单发推后的提现签名
export interface IGetKolWithdrawSignatureParams {
  /**
   * KOL钱包地址
   */
  address?: string;
  /**
   * 订单ID
   */
  order_item_id?: string;
}
export const getKolWithdrawSignature = (params: IGetKolWithdrawSignatureParams) => {
  return kolRequest.get(ENDPOINT_URL.KOL_WITHDRAW_SIGNATURE, { ...params });
};

// 验证是不是需要重新登录
export const verifyIsNeedLogin = () => {
  return kolRequest.get(ENDPOINT_URL.KOL_VERIFY_IS_NEED_LOGIN);
};
//ladingpage 获取kols
export const LoadingPageGetKolList = () => {
  return kolRequest.get(ENDPOINT_URL.LADINGPAGE_GET_KOL_LIST);
};

//loadingpage 获取最新推文
export const LoadingPageLastContent = () => {
  return kolRequest.get(ENDPOINT_URL.LADINGPAGE_GET_LAST_CONTENT);
};

//loadinpage 统计
export const LoadingPageStatistics = () => {
  return kolRequest.get(ENDPOINT_URL.LADINGPAGE_GET_STATISTICS);
};
// 意图识别
export const chat = (params: any, signal?: AbortSignal) => {
  return request.post(ENDPOINT_URL.KOL_CHAT, { ...params }, { signal });
};

// 提取订单未消费金额-签名
export interface IGetOrderUnconsumedAmountSignatureParams {
  /**
   * 订单ID
   */
  order_id: number;
}
export const getOrderUnconsumedAmountSignature = (
  params: IGetOrderUnconsumedAmountSignatureParams
) => {
  return request.get(ENDPOINT_URL.KOL_GET_ORDER_UNCONSUMED_AMOUNT_SIGNATURE, { ...params });
};

/***
 * 订单生成推文预览
 */
export const getOrderContentGen = (params: { project_id: string; service_type_code: string }) => {
  return request.post(ENDPOINT_URL.ORDER_CONTENT_GEN, { ...params });
};

// 从推特链接获取特推信息
export const getTweetInfoByUrl = (params: { tweet_link: string }) => {
  return request.get(ENDPOINT_URL.GET_TWEET_INFO_BY_URL, { ...params });
};

export const getKolInfoByUserName = (params: { username: string }) => {
  return request.get(ENDPOINT_URL.GET_KOL_DETAIL_BY_USERNAME, { ...params });
};

export const brandingGetProjectInfo = (params: { screen_name: string }) => {
  return request.get(ENDPOINT_URL.BRANDING_GET_PROJECT_INFO, { ...params });
};

export const brandingMarketEvents = (params: { page: number; page_size: number; type: string }) => {
  return request.get('/kol/api/v2/banding/market/events', { ...params });
};

export const brandingKOLCampaigns = (params: { page: number; page_size: number }) => {
  return request.get('/kol/api/v2/banding/linkol/campaigns', { ...params });
};

export const brandinSentimentGood = (params: { page: number; page_size: number; type: number }) => {
  return request.get('/kol/api/v2/banding/sentiment/good', { ...params });
};

export const brandinSentimentBad = (params: { page: number; page_size: number; type: number }) => {
  return request.get('/kol/api/v2/banding/sentiment/bad', { ...params });
};

export const brandinGetProjectInfo = (params: { screen_name: any }) => {
  return request.get('/kol/api/v2/banding/project/info', { ...params });
};
export const brandinGetProjectMetics = (params: { screen_name: any; type: 0 | 1 | 2 | 4 }) => {
  return request.get('/kol/api/v2/banding/project/metrics', { ...params });
};

export const brandinRanking = (params: {
  page: number;
  page_size: number;
  type: 0 | 1 | 2 | 3 | 4;
}) => {
  return request.get('/kol/api/v2/banding/value/ranking', { ...params });
};

export const brandinGetCommunityActivity = (params: {
  page: number;
  page_size: number;
  screen_name: any;
  type: 0 | 1 | 2;
}) => {
  return request.get('/kol/api/v2/banding/community/activity', { ...params });
};

// PaymentProcessed的结果确认
export interface IBrandinPaymentProcessedParams {
  kol: string;
  token: string;
  amount: string;
  orderId: string;
}
export const brandinPaymentProcessed = (params: IBrandinPaymentProcessedParams) => {
  return kolRequest.post(ENDPOINT_URL.BRANDING_PAYMENT_PROCESSED, { ...params });
};

// redeemed结果确认
export interface IBrandinRedeemedParams {
  project: string;
  token: string;
  amount: string;
  orderId: string;
}
export const brandinRedeemed = (params: IBrandinRedeemedParams) => {
  return request.post(ENDPOINT_URL.BRANDING_REDEEMED, { ...params });
};

// 活动类型
export const getActivityType = () => {
  return request.get(ENDPOINT_URL.GET_ACTIVITY_TYPE);
};

// 获取奖励规则
export const getRewardRule = () => {
  return request.get(ENDPOINT_URL.GET_REWARD_RULE);
};

// 创建活动
export interface ICreateActivityRequest {
  /**
   * 活动类型ID
   */
  active_type_id: string;
  /**
   * 海报URL
   */
  cover_img: string;
  /**
   * 活动描述
   */
  description: string;
  /**
   * 活动结束时间
   */
  end: string;
  /**
   * 奖励规则参数
   */
  params: any;
  /**
   * 项目id
   */
  project_id: string;
  /**
   * 推文要求
   */
  requirement: string;
  /**
   * 活动总奖励
   */
  reward_amount: string;
  /**
   * 奖励发放规则ID
   */
  reward_rule_id: string;
  /**
   * 活动开始时间，形式是2025-07-07 14:30:00
   */
  start: string;
  /**
   * 活动标题
   */
  title: string;
}
export const createActivity = (params: ICreateActivityRequest) => {
  return request.post(ENDPOINT_URL.CREATE_ACTIVITY, { ...params });
};

// 创建活动支付完以后的回调
export interface ICreateActivityCallbackRequest {
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 交易哈希
   */
  tx_hash: string;
}
export const createActivityCallback = (params: ICreateActivityCallbackRequest) => {
  return request.post(ENDPOINT_URL.CREATE_ACTIVITY_CALLBACK, { ...params });
};

// 活动支付给参与人奖励后的支付回调接口
export interface ICreateActivityCallbackRewardRequest {
  /**
   * 活动ID
   */
  pay_params: PayParam[];
  /**
   * 交易哈希
   */
  tx_hash: string;
}

export interface PayParam {
  /**
   * 活动参与记录的ID
   */
  active_join_id: number;
  /**
   * 金额
   */
  amount: string;
}
export const createActivityCallbackReward = (params: ICreateActivityCallbackRewardRequest) => {
  return request.post(ENDPOINT_URL.CREATE_ACTIVITY_CALLBACK_REWARD, { ...params });
};

//活动列表
export const marketEventsGetActives = (params: {
  page: number;
  page_size: number;
  kw: string;
  data_type: 'new' | 'hot' | 'hig' | 'deadline' | '';
  active_type_id?: number;
}) => {
  return request.get('/kol/api/v3/index/actives/', { ...params });
};

// 活动广场的活动列表 -用户登录
export interface IMarketEventsGetActivesLoginParams {
  /**
   * 活动类型ID
   */
  active_type_id?: number;
  /**
   * new表示最新发布，hot表示热门推荐，high表示高奖励，deadline表示即将到期
   */
  data_type?: string;
  /**
   * 1表示已经验证的 0表示未验证
   */
  is_verify?: number;
  /**
   * 搜索关键字
   */
  kw?: string;
  page?: number;
  size?: number;
  is_on?: 0 | 1;
  /**
   * 活动标签 X402是搜索X402相关的，X-Launch是搜索x-launch活动
   */
  tag?: 'X402' | 'X-Launch';
}
export interface IMarketEventsGetActivesLoginData {
  current_page: number;
  list: IMarketEventsGetActivesLoginList[];
  page_range: number[];
  total: number;
}

export interface IMarketEventsGetActivesLoginList {
  a_type: string;
  /**
   * 活动类型
   */
  active_type: IMarketEventsGetActivesLoginActiveType;
  /**
   * 代币网络
   */
  chain_type: string;
  /**
   * 海报
   */
  cover_img: string;
  /**
   * 剩余天数
   */
  days_remaining: number;
  /**
   * 描述
   */
  description: string;
  /**
   * 结束时间
   */
  end: string;
  id: number;
  /**
   * Agent是否是自动参与
   */
  is_auto_join: boolean;
  /**
   * 是否已经认证
   */
  is_verified: boolean;
  /**
   * 参与数
   */
  join_count: number;
  /**
   * 参与人列表
   */
  joins: string[];
  /**
   * 参与人数
   */
  participants: number;
  /**
   * 关联的项目
   */
  project: IMarketEventsGetActivesLoginProject;
  /**
   * 未领取奖励
   */
  receive_amount: number | number;
  /**
   * 推文要求
   */
  requirement: string;
  /**
   * 奖励
   */
  reward_amount: number;
  short_desc: null | string;
  /**
   * 开始时间
   */
  start: string;
  /**
   * 标题
   */
  title: string;
  /**
   * 代币类型
   */
  token_type: string;
  /**
   * 代币图片
   */
  token_icon: string;
  /**
   * 代币精度
   */
  token_decimals: string;
}

/**
 * 活动类型
 */
export interface IMarketEventsGetActivesLoginActiveType {
  code: string;
  en_name: string;
  id: number;
  zh_name: string;
}

/**
 * 关联的项目
 */
export interface IMarketEventsGetActivesLoginProject {
  id: number;
  logo: string;
  name: string;
}
export const marketEventsGetActivesLogin = (params: IMarketEventsGetActivesLoginParams) => {
  return kolRequest.get<IMarketEventsGetActivesLoginData>('/kol/api/v3/index/actives/login/', {
    ...params,
  });
};

// 普通用户未登录状态下的活动详情
export interface IEventInfoResponseData {
  /**
   * 活动类型
   */
  active_type: ActiveType;
  /**
   * 品牌价值新增率，已经乘100了
   */
  brand_value_increase: number;
  /**
   * 海报
   */
  cover_img: string;
  /**
   * 描述
   */
  description: string;
  /**
   * 结束时间
   */
  end: string;
  id: number;
  /**
   * 总参与人数
   */
  join_count: number;
  /**
   * 关联的项目信息
   */
  project: ActiveInfoProject;
  /**
   * 要求
   */
  requirement: string;
  /**
   * 奖励金额
   */
  reward_amount: number;
  /**
   * 开始时间
   */
  start: string;
  /**
   * 标题
   */
  title: string;
  /**
   * 总品牌价值
   */
  total_brand_value: number;
  /**
   * 是否是创建人
   */
  is_creator?: boolean;
  /**
   * AI分析
   */
  ai_analysis?: string;
  /**
   * 状态
   */
  status?: string;
  /**
   * 奖励规则
   */
  reward_rule?: RewardRuleDetail;
  /**
   * 品牌价值
   */
  brand_value?: BrandValue;
  /**
   * 活动类型
   * normal是普通活动，platform是平台活动
   */
  a_type?: 'normal' | 'platform';
  /**
   * 用户奖励
   */
  user_reward?: number;
  /**
   * 代币网络
   */
  chain_type: string;
  /**
   * 代币地址
   */
  token_address: string;
  /**
   * 代币类型 symbol
   */
  token_type: string;
  /**
   * 代币图片
   */
  token_icon: string;
  /**
   * 代币精度
   */
  token_decimals: string;
  /**
   * 是否认证
   */
  is_verified?: boolean;
}

/**
 * 参与人的品牌价值
 */
export interface BrandValue {
  /**
   * 占比
   */
  percentage: number;
  /**
   * 总价值
   */
  total: number;
  /**
   * 价值
   */
  value: number;
}
/**
 * 奖励规则说明
 */
export interface RewardRuleDetail {
  /**
   * 规则代码
   */
  code: string;
  /**
   * 规则下的参数
   */
  params: { [key: string]: any };
}
/**
 * 奖励说明
 */
export interface RewardRule {
  /**
   * 规则代码
   */
  code: string;
  /**
   * 奖励的英文名
   */
  en_name: string;
  id: number;
  /**
   * 奖励的中文名
   */
  zh_name: string;
}
/**
 * 规则描述
 */
export interface Desc {
  /**
   * 英文版
   */
  en_desc: string;
  /**
   * 中文版
   */
  zh_desc: string;
}
/**
 * 关联的项目信息
 */
export interface ActiveInfoProject {
  category: string[];
  id: number;
  link: string;
  logo: string;
  name: string;
  website: string;
  desc: string;
  telegram: string;
  discord: string;
}
export const getActivityDetail = (active_id: string) => {
  return kolRequest.get<IEventInfoResponseData>(`/kol/api/v3/active/${active_id}/unlogin/`);
};

// 普通用户登录状态下的活动详情
export const getActivityDetailLogin = (active_id: string) => {
  return kolRequest.get<IEventInfoResponseData>(`/kol/api/v3/active/${active_id}/login/`);
};

// 从仪表板的活动列表进去的活动详情-创建人看见的详情
export const getActivityDetailFromDashboard = (active_id: string) => {
  return request.get(`/kol/api/v3/active/${active_id}/creator/`);
};

export interface ICampaignListResponseData {
  current_page: number;
  list: ICampaignListItem[];
  page_range: number[];
  total: number;
}

export interface ICampaignListItem {
  /**
   * 活动类型
   */
  active_type: ActiveType;
  /**
   * 海报
   */
  cover_img: string;
  /**
   * 结束时间
   */
  end: string;
  id: number;
  /**
   * 项目
   */
  project: ActiveProject;
  project_id: number;
  reward_amount: string;
  /**
   * 活动金额
   */
  reward_amount_yuan: number;
  /**
   * 奖励规则类型
   */
  reward_rule: ActiveRewardRule;
  /**
   * 开始时间
   */
  start: string;
  /**
   * 标题
   */
  title: string;
  /**
   * 开始北京时间
   */
  start_bj: string;
  /**
   * 结束北京时间
   */
  end_bj: string;
}

/**
 * 活动类型
 */
export interface ActiveType {
  code: string;
  en_name: string;
  id: number;
  zh_name: string;
}

/**
 * 项目
 */
export interface ActiveProject {
  id: number;
  logo: string;
  name: string;
}

/**
 * 奖励规则类型
 */
export interface ActiveRewardRule {
  /**
   * 代码
   */
  code: string;
  /**
   * 英文
   */
  en_name: string;
  id: number;
  /**
   * 中文
   */
  zh_name: string;
}

// 仪表盘里的活动列表
export const getDashboardActivityList = (params: { page: number; size: number }) => {
  return request.get<ICampaignListResponseData>(`/kol/api/v3/actives/`, { ...params });
};

// 更新活动信息
export interface IUpdateActivityRequest {
  /**
   * 活动类型ID
   */
  active_type_id: string;
  /**
   * 海报URL
   */
  cover_img: string;
  /**
   * 活动描述
   */
  description: string;
  /**
   * 活动结束时间
   */
  end: string;
  /**
   * 奖励规则参数
   */
  params: any;
  /**
   * 项目id
   */
  project_id: string;
  /**
   * 推文要求
   */
  requirement: string;
  /**
   * 活动总奖励
   */
  reward_amount: string;
  /**
   * 奖励发放规则ID
   */
  reward_rule_id: string;
  /**
   * 活动开始时间，形式是2025-07-07 14:30:00
   */
  start: string;
  /**
   * 活动标题
   */
  title: string;
}

export const updateActivity = (id: number, params: IUpdateActivityRequest) => {
  return request.put(`${ENDPOINT_URL.UPDATE_ACTIVITY}${id}/`, { ...params });
};

// 仪表盘里获取活动详情
export const getCampaignDetails = (id: string) => {
  return request.get(`/kol/api/v3/active/${id}/creator/`);
};

// 参与名单-活动创建人的详情页里面的
export interface IGetCampaignJoinListParams {
  /**
   * 活动ID
   */
  active_id?: number;
  /**
   * 页码
   */
  page?: number;
  /**
   * 每页最大数据量
   */
  size?: number;
}
export interface IGetCampaignJoinListResponseData {
  current_page: number;
  list: IGetCampaignJoinListItem[];
  page_range: number[];
  total: number;
}

export interface IGetCampaignJoinListItem {
  /**
   * 品牌价值
   */
  brand_value?: number;
  id?: number;
  /**
   * @前边的名字
   */
  name?: string;
  /**
   * 头像
   */
  profile_image_url?: string;
  /**
   * 区间范围，活动规则的代码是segmented_distribution才有这个字段
   */
  ranges?: string;
  /**
   * 奖励金额
   */
  receive_amount?: number;
  /**
   * @后面的名字
   */
  screen_name?: string;
  /**
   * 推文链接
   */
  tweet_url?: string;
  /**
   * 钱包地址
   */
  wallet_address?: null;
  /**
   * 奖励状态
   */
  reward_status: RewardStatus;
}
export enum RewardStatus {
  not_sure = 'not_sure',
  selected = 'selected',
  un_selected = 'un_selected',
  receiving = 'receiving',
  received = 'received',
  failed = 'failed',
}
export const getCampaignJoinList = (params: IGetCampaignJoinListParams) => {
  return kolRequest.get<IGetCampaignJoinListResponseData>(`/kol/api/v3/active/joins/`, {
    ...params,
  });
};

// 提交活动推文链接
export interface IPostTweetLinkParams {
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 推特链接
   */
  tweet_url: string;
  /**
   * 邀请码
   */
  invite_code?: string;
}
export const postTweetLink = (params: IPostTweetLinkParams) => {
  return kolRequest.post(`/kol/api/v6/submit/verify/`, params);
};

// 提交活动推文链接-线下活动
export interface IPostTweetLinkOfflineParams {
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 推特链接
   */
  tweet_url: string;
  /**
   * 邮箱
   */
  email: string;
  /**
   * 活动码
   */
  code: string;
}
export const postTweetLinkOffline = (params: IPostTweetLinkOfflineParams) => {
  return kolRequest.post(`/kol/api/v6/submit/platform/verify/`, params);
};

// 领取奖励的按钮状态
export const getReceiveRewardButtonStatus = (id: number) => {
  return kolRequest.get(`/kol/api/v3/reward/btn/status/`, {
    active_id: id,
  });
};

// 品牌价值折线图
export const getBrandValueLineChart = (id: number) => {
  return kolRequest.get(`/kol/api/v3/active/brand_value/chart/`, {
    active_id: id,
  });
};

// 领取奖励签名
export interface IGetReceiveRewardSignatureParams {
  /**
   * 代币地址
   */
  tokenAddress: string;
  /**
   * 活动ID
   */
  activeId: string;
  /**
   * 钱包地址
   */
  receiver: string;
}
export const getReceiveRewardSignature = (params: IGetReceiveRewardSignatureParams) => {
  return kolRequest.post(`/kol/api/v6/claim_reward/sign/`, params);
};

// BSC获得领奖奖励签名
export interface IGetReceiveRewardSignatureBSCParams {
  /**
   * 代币地址
   */
  tokenAddress: string;
  /**
   * 活动ID
   */
  activeId: string;
  /**
   * 钱包地址
   */
  receiver: string;
  chainId: number;
}
export const getReceiveRewardSignatureV7 = (params: IGetReceiveRewardSignatureBSCParams) => {
  return kolRequest.post(`/kol/api/v7/claim_reward/sign/`, params);
};

// 获得领奖奖励回调接口 BSC

//某个活动的参与推文记录
export interface IGetActivityPostsParams {
  /**
   * 语言
   * 国家名字对应的缩写，en英文，zh中文,不传表示获取全部
   */
  language: LanguageCodeShort | '';
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 页码
   */
  page: number;
  /**
   * 每页最大数据量
   */
  size: number;
}
export enum LanguageCode {
  Chinese = 'Chinese',
  English = 'English',
  Indonesian = 'Indonesian',
  Japanese = 'Japanese',
  Korea = 'Korea',
  Spanish = 'Spanish',
  French = 'French',
  German = 'German',
  Russian = 'Russian',
  Arabic = 'Arabic',
  Portuguese = 'Portuguese',
  Vietnamese = 'Vietnamese',
  Thai = 'Thai',
  Malay = 'Malay',
}
export enum LanguageCodeShort {
  All = '',
  Chinese = 'zh',
  English = 'en',
  Korea = 'ko',
  Indonesia = 'in',
  Japanese = 'ja',
  Spanish = 'es',
  French = 'fr',
  German = 'de',
  Russian = 'ru',
  Arabic = 'ar',
  Portuguese = 'pt',
  Vietnamese = 'vi',
  Thai = 'th',
  Malay = 'ms',
}

export interface IGetActivityPostsResponseData {
  current_page: number;
  list: IGetActivityPostsResponseDataItem[];
  page_range: number[];
  total: number;
}
export interface IGetActivityPostsResponseDataItem {
  id?: number;
  /**
   * 点赞数
   */
  like_count?: number;
  /**
   * @前边的名
   */
  name?: string;
  /**
   * 推特图片
   */
  profile_image_url?: string;
  /**
   * 评论数
   */
  reply_count?: number;
  /**
   * 转发数
   */
  retweet_count?: number;
  /**
   * @后面的名
   */
  screen_name?: string;
  /**
   * 推文创建时间
   */
  tweet_created_at?: string;
  /**
   * 语言
   */
  tweet_language?: string;
  /**
   * 推文媒体URL
   */
  tweet_medias?: string[];
  /**
   * 文本
   */
  tweet_text?: string;
  /**
   * 浏览量
   */
  view_count?: number;
  /**
   * 是否认证
   */
  is_verified: boolean;
  /**
   * 是否是真实用户
   */
  is_real_user: boolean;
  /**
   * 是否是代理
   */
  join_type: string;
}
export const getActivityPosts = (params: IGetActivityPostsParams) => {
  return kolRequest.get<IGetActivityPostsResponseData>(`/kol/api/v3/active/tweets/`, {
    ...params,
  });
};

// 活动的Leaderboard热力图数据
export interface IGetActivityLeaderboardParams {
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 6 12 那个7天也转化成小时7*24=168
   */
  hour?: number;
}
export interface IGetActivityLeaderboardResponseDataItem {
  /**
   * 品牌价值
   */
  amount: number;
  /**
   * 头像
   */
  icon: string;
  /**
   * 参与人昵称
   */
  name: string;
}
export const getActivityLeaderboard = (params: IGetActivityLeaderboardParams) => {
  return kolRequest.get<IGetActivityLeaderboardResponseDataItem[]>(
    `/kol/api/v3/active/tweet_brand_value/chart/`,
    {
      ...params,
    }
  );
};

// 某个活动的参与推文记录-自己的记录
export interface IGetActivityPostsMyRecordParams {
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 页码
   */
  page: number;
  /**
   * 每页数量
   */
  size: number;
}
export interface IGetActivityPostsMyRecordResponseData {
  /**
   * 当前页码
   */
  current_page: number;
  /**
   * 推文列表
   */
  list: IGetActivityPostsResponseDataItem[];
  /**
   * 页码范围
   */
  page_range: number[];
  /**
   * 总数
   */
  total: number;
}
export const getActivityPostsMyRecord = (params: IGetActivityPostsMyRecordParams) => {
  return kolRequest.get<IGetActivityPostsMyRecordResponseData>(`/kol/api/v3/active/self/tweets/`, {
    ...params,
  });
};

// Voices的top10列表
export interface IGetActivityVoicesTop10Params {
  /**
   * 活动ID
   */
  active_id: string;
}
export interface IGetActivityVoicesTop10ResponseData {
  /**
   * 品牌价值
   */
  brand_value?: number;
  id?: number;
  /**
   * @前的名字
   */
  name?: string;
  /**
   * 头像
   */
  profile_image_url?: string;
  /**
   * @后的名字
   */
  screen_name?: string;
  /**
   * 粉丝数
   */
  followers_count?: number;
  /**
   * 是否认证
   */
  is_verified?: boolean;
}
export const getActivityVoicesTop10 = (params: IGetActivityVoicesTop10Params) => {
  return kolRequest.get<IGetActivityVoicesTop10ResponseData[]>(`/kol/api/v3/active/voices/`, {
    ...params,
  });
};

// 分配奖励-活动创建人的操作
export interface ISubmitRewardParams {
  joins: Join[];
}

export interface Join {
  /**
   * 记录的ID
   */
  id: string;
  /**
   * 金额
   */
  receive_amount: string;
}
export const submitReward = (params: ISubmitRewardParams) => {
  return request.post(`/kol/api/v3/submit/reward/`, {
    ...params,
  });
};

// AI聊天生成推文
export const getAiChatTweet = (activeId: string, language: string) => {
  return kolRequest.post(`/kol/api/v3/chat/`, {
    messages: [
      {
        role: 'user',
        content: '生成项目推文，active_id是：' + activeId + '，生成的语言使用：' + language,
      },
    ],
    language: 'en',
  });
};

// 活动生成推文
export interface IGetActivityTweetParams {
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 'English', 'Chinese', 'Korea'中的一种
   */
  language: string;
}
export const getActivityTweet = (params: IGetActivityTweetParams) => {
  return kolRequest.get(`/kol/api/v3/generate/tweet/`, {
    ...params,
  });
};

// 发送活动推文
export interface ISendActivityTweetParams {
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 推文内容，中文不超过160个字符，英文下不超过280
   */
  content: string;
  /**
   * 语言，en表示英文，zh表示中文
   */
  language: string;
  /**
   * 图片数组
   */
  medias: string[];
  /**
   * 邀请码
   */
  invite_code?: string;
}
export const sendActivityTweet = (params: ISendActivityTweetParams) => {
  return kolRequest.post(`/kol/api/v6/post/tweet/`, {
    ...params,
  });
};

// 发送活动推文-platform类型活动
export interface ISendActivityTweetPlatformParams {
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 推文内容，中文不超过160个字符，英文下不超过280
   */
  content: string;
  /**
   * 邀请码
   */
  invite_code: string;
  /**
   * 语言，en表示英文，zh表示中文
   */
  language: string;
  /**
   * 图片数组
   */
  medias: string[];
}
export const sendActivityTweetPlatform = (params: ISendActivityTweetPlatformParams) => {
  return kolRequest.post(`/kol/api/v6/post/platform/tweet/`, {
    ...params,
  });
};

// 查询当前用户在某个活动中的抽奖资格和没领取的中奖金额
export interface IGetUserActivityRewardParams {
  /**
   * 活动ID
   */
  active_id: string;
}
export interface IGetUserActivityRewardResponseData {
  /**
   * 中奖概率
   */
  percent: number;
  /**
   * 抽奖资格
   */
  number: number;
  /**
   * 活动奖励总金额
   */
  total_reward: number;
  /**
   * 已领取的奖励金额
   */
  available_reward: number;
  /**
   * 总领取的金额
   */
  total_receive_amount: number;
  /**
   * 失败次数限制
   */
  fail_limit: number;
  /**
   * 失败次数
   */
  fail_times: number;
  /**
   * 等级
   */
  level: string;
  /**
   * 必须中奖次数限制
   */
  must_win_limit: number;
  /**
   * 积分
   */
  points: number;
  /**
   * 今日参与次数
   */
  today_join: number;
  /**
   * 必须中奖次数
   */
  used_must_win_times: number;
  /**
   * 每日抽次参与时间
   */
  today_join_at: string;
  /**
   * 是否已验证关注
   */
  is_verified_follow: boolean;
  /**
   * 是否已提现
   */
  has_withdrawn: boolean;
}
export const getUserActivityReward = (params: IGetUserActivityRewardParams) => {
  return kolRequest.get<IGetUserActivityRewardResponseData>(`/kol/api/v6/tickets/`, {
    ...params,
  });
};

// 抽奖
export interface IRaffleParams {
  /**
   * 活动ID
   */
  active_id: string;
}
export const raffle = (params: IRaffleParams) => {
  return kolRequest.post(`/kol/api/v6/lottery/`, {
    ...params,
  });
};

// 获得领奖奖励回调接口
export interface IGetReceiveRewardCallbackParams {
  /**
   * 交易哈希
   */
  tx_hash: string;
  /**
   * 奖励ID
   */
  rewardIds: number[];
}
export const getReceiveRewardCallback = (params: IGetReceiveRewardCallbackParams) => {
  return kolRequest.post(`/kol/api/v6/claim_reward/success/`, params);
};

// 获得领奖奖励回调接口 BSC
export interface IGetReceiveRewardCallbackV7Params {
  /**
   * 交易哈希
   */
  txHash: string;
  /**
   * 奖励ID
   */
  rewardIds: number[];
  /**
   * 代币地址
   */
  tokenAddress: string;
  /**
   * 活动ID
   */
  activeId: string;
  /**
   * 链ID
   */
  chainId: number;
}
export const getReceiveRewardCallbackV7 = (params: IGetReceiveRewardCallbackV7Params) => {
  return kolRequest.post(`/kol/api/v7/claim_reward/success/`, params);
};

// Solana 领取奖励接口
export interface IGetSolanaClaimRewardParams {
  /**
   * 领取金额
   */
  receive_amount: number;
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 签名
   */
  solana_sign: string;
  /**
   * Solana 钱包地址
   */
  solana_address: string;
  /**
   * 时间戳
   */
  timestamp: number;
}
export const getSolanaClaimReward = (params: IGetSolanaClaimRewardParams) => {
  return kolRequest.post(ENDPOINT_URL.SOLANA_CLAIM_REWARD, params);
};

// tg热门KOL
export interface IGetTgHotKolParams {
  /**
   * 页码
   */
  page: string;
  /**
   * 每页条数
   */
  size: string;
}
export const getTgHotKol = (params: IGetTgHotKolParams) => {
  return kolRequest.get(`/kol/api/v3/kol-search-history/`, { ...params });
};

/**
 * 获取价格
 * @param params 用户名
 * @returns 价格
 */
export interface IGetPriceParams {
  screen_name: string;
}
export interface IGetPriceData {
  /**
   * 当前KOL价格
   */
  current_value: number;
  kol: Kol;
  /**
   * 领先百分比
   */
  leading_percentage: number;
  /**
   * 是否已经接受报价
   */
  is_do_accepted: boolean;
}

export interface Kol {
  name: string;
  profile_image_url: string;
  screen_name: string;
}
export const getPrice = async (params: IGetPriceParams) => {
  return request.get<IGetPriceData>(ENDPOINT_URL.GET_PRICE, { ...params });
};

// 推特分享回调
export interface IGetTwitterShareCallbackParams {
  /**
   * 推特ID
   */
  active_id: string;
}
export interface IGetTwitterShareCallbackData {
  /**
   * 获取到的抽奖资格
   */
  number: number;
}
export const getTwitterShareCallback = (params: IGetTwitterShareCallbackParams) => {
  return kolRequest.get<IGetTwitterShareCallbackData>('/kol/api/v6/share/callback/', { ...params });
};

// 检查是不是关注了 关注了给一个票
export interface ICheckIsFollowedParams {
  /**
   * 推特ID
   */
  active_id: string;
}
export interface ICheckIsFollowedData {
  /**
   * 是不是关注了
   */
  is_followed: boolean;
  /**
   * 抽奖券
   */
  ticket: number;
}
export const checkIsFollowed = (params: ICheckIsFollowedParams) => {
  return kolRequest.post<ICheckIsFollowedData>('/kol/api/v6/following/check/', { ...params });
};

// 获取活动邀请码
export interface IGetInvitationCodeParams {
  /**
   * 活动ID
   */
  active_id: string;
}
export interface IGetInvitationCodeData {
  /**
   * 邀请码
   */
  invite_code: string;
  /**
   * 邀请人数量
   */
  invited_num: number;
  /**
   * 抽奖券数量
   */
  ticket_num: number;
}
export const getInvitationCode = (params: IGetInvitationCodeParams) => {
  return kolRequest.get<IGetInvitationCodeData>('/kol/api/v6/active/invite_code/', { ...params });
};

// 活动提现记录
export interface IGetActivityWithdrawRecordParams {
  /**
   * 活动ID
   */
  active_id: string;
}
export interface IGetActivityWithdrawRecordData {
  /**
   * 链类型
   */
  chain_type: string;
  id: number;
  /**
   * @前边的名字
   */
  name: string;
  /**
   * 金额
   */
  receive_amount: number;
  /**
   * 领取时间
   */
  receive_at: string;
  /**
   * 哈希
   */
  receive_tx_hash: string;
  /**
   * @后面的名字
   */
  scree_name: string;
  /**
   * 代币类型
   */
  token_type: string;
  /**
   * 代币图标
   */
  token_icon: string;
  /**
   * 代币精度
   */
  token_decimals: string;
  /**
   * 用户头像
   */
  avatar: string;
}
export const getActivityWithdrawRecord = (params: IGetActivityWithdrawRecordParams) => {
  return kolRequest.get<IGetActivityWithdrawRecordData[]>('/kol/api/v6/active/withdraws/', {
    ...params,
  });
};

// 用户粉丝
export const getActivityFollowers = () => {
  return kolRequest.get('/kol/api/v6/user/followers/');
};

// 获取用户是否接受了Agent
export interface IGetUserIsAcceptedAgentData {
  /**
   * 是否接受了Agent
   */
  is_accept: boolean;
}
export const getUserIsAcceptedAgent = () => {
  return kolRequest.get<IGetUserIsAcceptedAgentData>('/kol/api/v7/accept_agent/');
};

// 接受Agent
export interface IAcceptAgentParams {
  /**
   * 活动ID
   */
  active_id: number;
}
export const acceptAgent = (params: IAcceptAgentParams) => {
  return kolRequest.post('/kol/api/v7/accept_agent/', params);
};

// Ton 领取奖励接口
export interface IGetTonClaimRewardParams {
  /**
   * 领取金额
   */
  receive_amount: number;
  /**
   * 活动ID
   */
  active_id: string;
  /**
   * 签名
   */
  signature: string;
  /**
   * Ton 钱包地址
   */
  address: string;
  /**
   * 时间戳
   */
  timestamp: number;
  /**
   * 公钥
   */
  public_key: string;
  /**
   * 钱包状态
   */
  walletStateInit: string;
  /**
   * 域名
   */
  domain: string;
  /**
   * 消息
   */
  message: string;
}
export const getTonClaimReward = (params: IGetTonClaimRewardParams) => {
  return kolRequest.post('/kol/api/v6/claim_reward/ton/pay/', params);
};

// Agent详情
export interface IGetAgentDetailsData {
  /**
   * 邀请码
   */
  invite_code: string;
  /**
   * 积分
   */
  point: number;
  /**
   * 排名
   */
  rank: number;
  /**
   * 总奖励
   */
  total_reward: number;
  /**
   * 是否所有活动都自动参与
   */
  is_all_auto: boolean;
}
export const getAgentDetails = () => {
  return kolRequest.get<IGetAgentDetailsData>('/kol/api/v8/agent/detail/');
};

// reward列表
export interface IGetAgentRewardListParams {
  /**
   * 页码
   */
  page: number;
  /**
   * 每页数量
   */
  size: number;
}
export interface IGetAgentRewardListData {
  current_page: number;
  list: IGetAgentRewardListItem[];
  page_range: number[];
  total: number;
}
export interface IGetAgentRewardListItem {
  /**
   * 时间
   */
  created_at?: string;
  /**
   * 因为谁给的
   */
  from_user?: FromUser;
  /**
   * 奖励ID
   */
  id?: number;
  /**
   * 积分数
   */
  point?: number;
  /**
   * 奖励来源
   */
  reason?: string;
}
/**
 * 因为谁给的
 */
export interface FromUser {
  /**
   * 头像
   */
  profile_image_url: string;
  /**
   * 推特名
   */
  screen_name: string;
  [property: string]: any;
}

export const getAgentRewardList = (params: IGetAgentRewardListParams) => {
  return kolRequest.get<IGetAgentRewardListData>('/kol/api/v8/agent/rewards/', {
    ...params,
  });
};

// 用户的邀请列表,前20
export interface IGetAgentInviteeListItem {
  screen_name: string;
  profile_image_url: string;
  value: number;
}

export const getAgentInviteeList = () => {
  return kolRequest.get<IGetAgentInviteeListItem[]>('/kol/api/v8/user/invites/');
};

// 积分排行榜top15
export interface IGetAgentRankingListItem {
  id?: number;
  /**
   * 邀请人数
   */
  invitee_count?: number;
  /**
   * 积分
   */
  point?: number;
  /**
   * 头像
   */
  profile_image_url?: string;
  /**
   * 推特名
   */
  screen_name?: string;
}
export const getAgentRankingList = () => {
  return kolRequest.get<IGetAgentRankingListItem[]>('/kol/api/v8/points/top/');
};

// 修改活动是不是要自动参与
export interface IUpdateActivityAutoParticipateParams {
  /**
   * 活动ID
   */
  active_id: number;
  /**
   * 要修改成啥状态，on表示开启， off表示关闭
   */
  option: string;
}
export const updateActivityAutoParticipate = (params: IUpdateActivityAutoParticipateParams) => {
  return kolRequest.post('/kol/api/v8/active/status/', {
    ...params,
  });
};

// 积分排行榜top15
export interface IGetPointsTopListItem {
  id?: number;
  /**
   * 邀请人数
   */
  invitee_count?: number;
  /**
   * 积分
   */
  point?: number;
  /**
   * 头像
   */
  profile_image_url?: string;
  /**
   * 推特名
   */
  screen_name?: string;
}
export const getPointsTopList = () => {
  return kolRequest.get<IGetPointsTopListItem[]>('/kol/api/v8/points/top/');
};

// 一键全部开启
export const openAllActivityAutoParticipate = () => {
  return kolRequest.post('/kol/api/v8/openall/auto/');
};

// 捐献列表
export interface IGetDonateListParams {
  /**
   * 不传 就是全部排名，传了就是某个活动的排名
   */
  active_id?: string;
  /**
   * 页码
   */
  page?: number;
  /**
   * 每页最大条数
   */
  size?: number;
}
export interface IGetDonateListResponseData {
  current_page: number;
  list: IGetDonateListItem[];
  page_range: number[];
  total: number;
}
export interface IGetDonateListItem {
  /**
   * 活动ID
   */
  activity_id: number;
  /**
   * 金额
   */
  amount: string;
  /**
   * 创建时间
   */
  create_at: string;
  /**
   * id
   */
  id: number;
  /**
   * 对应的推特头像
   */
  profile_image_url: null | string;
  /**
   * 捐款人推特名
   */
  screen_name: null | string;
  /**
   * token地址
   */
  token_address: string;
  /**
   * token名
   */
  token_name: string;
  /**
   * 交易哈希
   */
  txid: string;
}
export const getDonateList = (params: IGetDonateListParams) => {
  return kolRequest.get<IGetDonateListResponseData>('/kol/api/v7/active/donates/', {
    ...params,
  });
};

// 获取活动捐献支持的代币信息
export interface IGetActivityDonateTokenInfoParams {
  active_id: number;
}
export interface IGetActivityDonateTokenInfoResponseDataItem {
  /**
   * 代币地址
   */
  coin_address?: string;
  /**
   * 代币名字
   */
  coin_name?: string;
  /**
   * 网络
   */
  coin_network?: string;
  id?: number;
  /**
   * 代币图标
   */
  icon?: string;
}
export const getActivityDonateTokenInfo = (params: IGetActivityDonateTokenInfoParams) => {
  return kolRequest.get<IGetActivityDonateTokenInfoResponseDataItem[]>(
    '/kol/api/v9/active/donates/',
    {
      ...params,
    }
  );
};

// donate成功接口
export interface IGetDonateSuccessParams {
  activeId: number;
  tokenAddress: string;
  amount: string;
  txid: string;
}
export const getDonateSuccess = (params: IGetDonateSuccessParams) => {
  return kolRequest.post('/kol/api/v7/donate/success/', {
    ...params,
  });
};

// 获取投票信息
export interface IGetVoteInfoResponseData {
  /**
   * id
   */
  id: number;
  /**
   * no的人数
   */
  no_count: number;
  /**
   * 投票内容
   */
  title: string;
  /**
   * 英文投票内容
   */
  en_title: string;
  /**
   * yes的人数
   */
  yes_count: number;
  /**
   * 用户投票详情
   */
  vote_detail: VoteDetail;
}

export interface VoteDetail {
  /**
   * false表示没投票
   */
  is_vote: boolean;
  /**
   * true表示yes false 表示NO
   */
  is_yes: null;
}

export const getVoteInfo = () => {
  return kolRequest.get<IGetVoteInfoResponseData>('/kol/api/v9/vote/content/');
};

// 投票
export interface IVoteParams {
  /**
   * yes的话传1 NO的话传0
   */
  is_yes: number;
  /**
   * 投票内容的ID
   */
  vote_content_id: number;
}
export const vote = (params: IVoteParams) => {
  return kolRequest.post('/kol/api/v9/vote/', {
    ...params,
  });
};

// 获取用户在三天内某个活动邀请的Real user人数
export interface IGetUserInviteRealUserCountParams {
  active_id: number;
}
export interface IGetUserInviteRealUserCountResponseData {
  /**
   * 数量，最多不超过3
   */
  count: number;
  /**
   * 三天之内的邀请人
   */
  users: RealUser[];
}

export interface RealUser {
  /**
   * 头像
   */
  avatar: string;
  /**
   * 推特昵称
   */
  name: string;
  /**
   * 推特用户名
   */
  screen_name: string;
}
export const getUserInviteRealUserCount = (params: IGetUserInviteRealUserCountParams) => {
  return kolRequest.get<IGetUserInviteRealUserCountResponseData>(`/kol/api/v6/user/active/invites/`, {
    ...params,
  });
};
