import blockies from 'ethereum-blockies';

function AddressAvatar({ address }: { address: string }) {
  // 使用 Blockies 生成头像
  const blockie = blockies.create({
    seed: address.toLowerCase(), // 以地址为种子
    size: 8, // 图案大小
    scale: 10, // 放大比例
  });

  return (
    <img
      src={blockie.toDataURL()} // 将图案转换为 Base64 URL
      alt="address-avatar"
      className="h-full w-full object-cover"
      style={{ borderRadius: '50%' }} // 圆形样式
    />
  );
}

export default AddressAvatar;
