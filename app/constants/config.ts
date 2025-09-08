export const CONTRACT_ADDRESS: Record<
  string,
  { pay_member_token_address: string; KOLServiceAddress: string; ActivityServiceAddress: string }
> = {
  '8453': {
    pay_member_token_address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    KOLServiceAddress: '0xD562135D926763d4132a3E7d55a536850E03bcA9',
    ActivityServiceAddress: '',
  },
  '32383': {
    pay_member_token_address: '0x736D175A2aCb2Bb3122298459F74aA0EfA586c2e',
    KOLServiceAddress: '0x3589bE56423585ae96c0E9Bc12AA142D31B721B2',
    ActivityServiceAddress: '',
  },
  '84532': {
    pay_member_token_address: '0x6909442C7572D06E28A9535AA99548d1279d1e44',
    KOLServiceAddress: '0x68Fab9e02bD60a1F9EBDD5bb192eE2C59Fb16970',
    ActivityServiceAddress: '0xd1CF4991BA007f1743eD5F51CF73c42f18E304Bd',
  },
};

export const getContractAddress = () => {
  return CONTRACT_ADDRESS[process.env.NEXT_PUBLIC_CHAIN_ID as string];
};
