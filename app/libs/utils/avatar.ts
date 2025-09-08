export const generateColorFromAddress = (address: string) => {
  const hash = address.slice(2, 10);
  const color = `#${hash}`;
  return color;
};

// 生成文字颜色
export const generateTextColorFromAddress = (address: string = '') => {
  if (!address) return '#FFFFFF';
  // 使用地址的不同部分生成文字颜色
  const hash = address.slice(8, 14);
  return `#${hash}`;
};

// 格式化地址显示：前4位 + ... + 后4位
export const formatAddress = (address: string = '', pre = 4, suf = 4): string => {
  if (!address) return '';
  if (address.length < 8) return address;

  const prefix = address.slice(0, pre);
  const suffix = address.slice(-suf);
  return `${prefix}...${suffix}`;
};
