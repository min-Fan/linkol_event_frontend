import { ethers } from 'ethers';

export const MAX256 = ethers.MaxUint256;

/**
 * 将数值转换为BigNumber（以wei为单位）
 * @param value - 要转换的数值（字符串或数字）
 * @param decimals - 代币的小数位数
 * @returns BigNumber类型的结果
 *
 * @example
 * parseToBigNumber("1.5", 18) => BigNumber { _hex: "0x14d1120d7b160000" }
 * parseToBigNumber(1.23, 6) => BigNumber { _hex: "0x12c000" }
 */
export function parseToBigNumber(value: number | string, decimals: number) {
  if (!value || value === '0' || value === 0) {
    return ethers.parseUnits('0', decimals);
  }

  try {
    return ethers.parseUnits(value.toString(), decimals);
  } catch (error) {
    console.error('parseToBigNumber error:', error);
    return ethers.parseUnits('0', decimals);
  }
}

/**
 * 将BigNumber转换为可读的字符串格式
 * @param value - 要格式化的BigNumber
 * @param decimals - 代币的小数位数
 * @returns 格式化后的字符串
 *
 * @example
 * formatBigNumber("1000000000000000000", 18) => "1.0"
 * formatBigNumber("1100000000000000000", 18) => "1.1"
 * formatBigNumber("1100000000000000000", 3) => "1100000000000000.0"
 */
export function formatBigNumber(value: bigint | string, decimals: number = 6): string {
  if (!value || value === '0' || value === 0n) {
    return '0';
  }

  try {
    return ethers.formatUnits(value, decimals);
  } catch (error) {
    console.error('formatBigNumber error:', error);
    return '0';
  }
}

/**
 * 计算多个KOL价格的总和
 * @param kols - KOL列表
 * @param count - 要计算的KOL数量
 * @param decimals - 代币的小数位数
 * @returns 格式化后的总金额字符串
 *
 * @example
 * calculateTotalAmount(kols, 5, 18) => "150.5"
 */
export function calculateTotalAmount(kols: any[], count: number, decimals: number): string {
  if (!kols?.length || !decimals) {
    return '0';
  }

  const sortedKOLs = [...kols].sort((a, b) => b.price_yuan - a.price_yuan);
  const totalAmount = sortedKOLs.slice(0, count).reduce(
    (acc, kol) => {
      const kolAmount = parseToBigNumber(kol.price_yuan, decimals);
      return acc + kolAmount;
    },
    ethers.parseUnits('0', decimals)
  );

  return formatBigNumber(totalAmount, decimals);
}

/**
 * 检查余额是否足够
 * @param balance - 当前余额
 * @param amount - 需要的金额
 * @param decimals - 代币的小数位数
 * @returns 是否余额足够
 *
 * @example
 * hasEnoughBalance(balance, "100", 18) => true/false
 */
export function hasEnoughBalance(balance: bigint, amount: string, decimals: number): boolean {
  if (!balance || !amount || !decimals) {
    return false;
  }

  const requiredAmount = parseToBigNumber(amount, decimals);
  return balance >= requiredAmount;
}

/**
 * 检查授权额度是否足够
 * @param allowance - 当前授权额度
 * @param amount - 需要的金额
 * @param decimals - 代币的小数位数
 * @returns 是否授权额度足够
 *
 * @example
 * hasEnoughAllowance(allowance, "100", 18) => true/false
 */
export function hasEnoughAllowance(allowance: bigint, amount: string, decimals: number): boolean {
  if (!allowance || !amount || !decimals) {
    return false;
  }

  const requiredAmount = parseToBigNumber(amount, decimals);
  return allowance >= requiredAmount;
}

/**
 * 将数值转换为合约调用所需的BigNumber格式
 * @param value - 要转换的数值
 * @param decimals - 代币的小数位数
 * @returns 合约调用所需的BigNumber
 *
 * @example
 * toContractAmount("1.5", 18) => BigNumber { _hex: "0x14d1120d7b160000" }
 */
export function toContractAmount(value: string | number, decimals: number) {
  return parseToBigNumber(value, decimals);
}

/**
 * 从合约返回的BigNumber转换为可读格式
 * @param value - 合约返回的BigNumber
 * @param decimals - 代币的小数位数
 * @returns 可读的字符串格式
 *
 * @example
 * fromContractAmount(bigNumberValue, 18) => "1.5"
 */
export function fromContractAmount(value: bigint, decimals: number): string {
  return formatBigNumber(value, decimals);
}

/**
 * 格式化显示余额（带符号）
 * @param balance - 余额
 * @param decimals - 代币的小数位数
 * @param symbol - 代币符号
 * @returns 格式化后的余额字符串
 *
 * @example
 * formatBalance(balance, 18, "USDT") => "1,234.56 USDT"
 */
export function formatBalance(balance: bigint, decimals: number, symbol: string = ''): string {
  const formatted = formatBigNumber(balance, decimals);
  const numericValue = parseFloat(formatted);

  // 添加千位分隔符
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const result = parts.join('.');
  return symbol ? `${result} ${symbol}` : result;
}
