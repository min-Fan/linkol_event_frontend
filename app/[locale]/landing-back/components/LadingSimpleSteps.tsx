import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import { FeiJi, Payment, Pencil, UserAdd } from '@assets/svg';

export default function LandingSimpleSteps() {
  const items = [
    {
      icon: <Pencil className="size-4" />,
      title: '1.Create Campaign',
      desc: 'Define your goals, target audience and set the budget.',
    },
    {
      icon: <UserAdd className="size-4" />,
      title: '2.Select KOLs',
      desc: 'Choose the most suitable KOL partners based on data indicators.',
    },
    {
      icon: <FeiJi className="size-4" />,
      title: '3.Launch & Track',
      desc: 'Publish campaign tasks and intelligent contracts automatically lock the budget.',
    },
    {
      icon: <Payment className="size-4" />,
      title: '4.Settle Commission',
      desc: 'After the campaign is completed, commissions are automatically settled based on on-chain data.',
    },
  ];

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <div className="box-border w-full space-y-4 bg-[rgba(136,187,243,0.2)] px-5 py-20">
      <div className="mx-auto space-y-4 sm:max-w-240" ref={ref}>
        <div className="text-4xl font-bold">4 Simple Steps</div>
        <div className="flex flex-wrap gap-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: index * 0.3, duration: 0.5 }}
              className="flex w-55 flex-col gap-y-5"
            >
              <div className="flex items-center gap-x-3">
                {item.icon}
                {index !== 3 && <div className="h-[1px] flex-1 bg-[#DBE0E5]"></div>}
              </div>
              <div className="text-base">
                <p className="font-medium">{item.title}</p>
                <p className="text-[#637387]">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
