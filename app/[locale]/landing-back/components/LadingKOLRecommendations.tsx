import CountUp from '@ui/countUp';
import {
  LoadingPageGetKolList,
  LoadingPageLastContent,
  LoadingPageStatistics,
} from '@libs/request';
import { useEffect, useState } from 'react';
export default function LadingKOLRecommendations() {
  useEffect(() => {
    init();
  }, []);

  const [kols, setKols] = useState([]);
  const [statistics, setStatistics] = useState({
    orders: 0,
    kols: 0,
    projects: 0,
    interaction: 0,
  });

  const init = async () => {
    try {
      const res = await LoadingPageGetKolList();

      const statisticsRes = await LoadingPageStatistics();
      if (statisticsRes.code == 200) {
        setStatistics(statisticsRes.data);
      }
      if (res.code == 200) {
        setKols(res.data || []);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="box-border w-full px-5 pt-20">
      <div className="m-auto grid grid-cols-1 gap-2 sm:grid-cols-2 md:max-w-240 md:grid-cols-4">
        <div className="box-border rounded-xl bg-[#E7F1FD] p-4 dark:bg-[#E7F1FD]/20">
          <p className="text-base font-medium">Onboard KOLs</p>

          <p className="text-2xl font-bold">
            <CountUp from={0} to={statistics?.kols} separator="," direction="up" duration={1} />+
          </p>
        </div>
        <div className="box-border rounded-xl bg-[#E7F1FD] p-4 dark:bg-[#E7F1FD]/20">
          <p className="text-base font-medium">Partner Projects</p>
          <p className="text-2xl font-bold">
            {' '}
            <CountUp from={0} to={statistics?.projects} separator="," direction="up" duration={1} />
            +
          </p>
        </div>
        <div className="box-border rounded-xl bg-[#E7F1FD] p-4 dark:bg-[#E7F1FD]/20">
          <p className="text-base font-medium">Success Campaigns</p>
          <p className="text-2xl font-bold">
            {' '}
            <CountUp from={0} to={statistics?.orders} separator="," direction="up" duration={1} />+
            <CountUp from={0} to={statistics?.orders} separator="," direction="up" duration={1} />+
          </p>
        </div>
        <div className="box-border rounded-xl bg-[#E7F1FD] p-4 dark:bg-[#E7F1FD]/20">
          <p className="text-base font-medium">Interaction Improved</p>
          <p className="text-2xl font-bold">
            {' '}
            <CountUp from={0} to={statistics?.interaction} direction="up" duration={1} />%
          </p>
        </div>
      </div>

      <div className="mt-40 mb-15 text-center text-4xl font-bold">KOL Recommendations</div>

      <div className="m-auto box-border grid grid-cols-1 justify-between gap-7 p-4 sm:grid-cols-3 md:max-w-240 md:grid-cols-6">
        {kols?.map((item: any, index: number) => {
          return (
            <div
              key={item.id || index}
              className="flex flex-col items-center justify-center space-y-4"
            >
              <div className="size-33 overflow-hidden rounded-full">
                <img src={item.avatar} alt="background" className="size-full object-cover" />
              </div>
              <div className="text-center">
                <div className="text-base">{item.username}</div>
                <div className="text-md space-x-1 text-[#637387]">
                  {(item?.tags || []).map((tag) => {
                    return <span key={tag}>{tag}</span>;
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
