import { useAppDispatch } from '@store/hooks';
import { updateConfig } from '@store/reducers/userSlice';
import { getPlatformWallet, getTags } from '@libs/request';
import { Tags } from '@store/reducers/types';

export const useGetConst = () => {
  const dispatch = useAppDispatch();

  const getConst = async () => {
    try {
      // getPlatformWallet().then((res) => {
      //   if (res.code === 200) {
      //     dispatch(
      //       updateConfig({
      //         key: 'platform_receive_address',
      //         value: res.data.platform_receive_address || '',
      //       })
      //     );
      //   }
      // });
    } catch (error) {
      console.log(error);
    }
  };

  return { getConst };
};
