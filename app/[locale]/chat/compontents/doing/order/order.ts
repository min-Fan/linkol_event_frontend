import {
  createOrderV2,
  payOrderV2,
  getTweetTypeAndAddOnService,
  createProject,
  getKol,
} from '@libs/request';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

// 获取KOL信息
export const getKOLInfo = async (
  kolIds: number[],
  kolPrices?: Array<{ id: number; price: number }>
) => {
  try {
    // 如果有传入的price数据，直接使用
    if (kolPrices && kolPrices.length > 0) {
      return kolPrices.map((kol) => ({
        id: kol.id,
        price_yuan: kol.price,
        name: `KOL-${kol.id}`, // 临时名称，实际应该从API获取
      }));
    }

    // 否则从API获取KOL信息
    const response: any = await getKol({ page: 1, size: 9999 });
    if (response.code === 200) {
      // 根据kolIds过滤出选中的KOL
      const allKols = response.data.list || [];
      const selectedKols = allKols.filter((kol: any) => kolIds.includes(kol.id));
      return selectedKols;
    } else {
      throw new Error(response.msg || '获取KOL信息失败');
    }
  } catch (error) {
    console.error('获取KOL信息失败:', error);
    throw error;
  }
};

// 创建项目
export const createNewProject = async (projectData: {
  name: string;
  desc: string;
  website?: string;
  icon?: string;
}) => {
  try {
    const response: any = await createProject({
      name: projectData.name,
      desc: projectData.desc,
      website: projectData.website || '',
      document_urls: [],
      icon: projectData.icon || '',
      tweet_url: '',
    });

    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      throw new Error(response.msg || '创建项目失败');
    }
  } catch (error) {
    console.error('创建项目失败:', error);
    throw error;
  }
};

// 计算订单总金额
export const calculateOrderAmount = (kols: any[]) => {
  return kols.reduce((total, kol) => total + kol.price_yuan, 0);
};

// 获取服务类型数据
export const getServiceData = async () => {
  try {
    const response: any = await getTweetTypeAndAddOnService();
    if (response.code === 200) {
      return response.data;
    } else {
      throw new Error(response.msg || '获取服务数据失败');
    }
  } catch (error) {
    console.error('获取服务数据失败:', error);
    throw error;
  }
};

// 创建订单
export const createOrder = async (orderParams: any) => {
  try {
    const response: any = await createOrderV2(orderParams);
    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      throw new Error(response.msg || '创建订单失败');
    }
  } catch (error) {
    console.error('创建订单失败:', error);
    throw error;
  }
};

// 支付订单
export const payOrder = async (orderNo: string, txHash: string) => {
  try {
    const response: any = await payOrderV2({
      order_no: orderNo,
      tx_hash: txHash,
    });
    if (response.code === 200 && response.data) {
      return response.data;
    } else {
      throw new Error(response.msg || '支付订单失败');
    }
  } catch (error) {
    console.error('支付订单失败:', error);
    throw error;
  }
};

// 格式化日期为yyyy-MM-dd
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 验证订单参数
export const validateOrderParams = (params: any) => {
  const errors: string[] = [];

  if (!params.promotional_materials?.trim()) {
    errors.push('请填写宣传材料');
  }

  if (!params.promotional_start_at) {
    errors.push('请选择开始时间');
  }

  if (!params.promotional_end_at) {
    errors.push('请选择结束时间');
  }

  if (params.promotional_start_at && params.promotional_end_at) {
    const startDate = new Date(params.promotional_start_at);
    const endDate = new Date(params.promotional_end_at);
    if (endDate < startDate) {
      errors.push('结束时间不能早于开始时间');
    }
  }

  if (!params.tweet_service_type_id) {
    errors.push('请选择推文类型');
  }

  return errors;
};
