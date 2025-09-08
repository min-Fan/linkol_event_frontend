import { Cusotmer, FeiJi, LineChart } from '@assets/svg';
import { motion } from 'motion/react';

export default function LadingLinkolCoreFeatures() {
  const cards = [
    {
      icon: <FeiJi className="size-6" />,
      title: 'AI-Driven KOL Intelligent Matching',
      desc: 'Based on multidimensional data analysis, accurately match KOLs that fit the project and contract compatibility, improving promotion effectiveness and conversion rates.',
    },
    {
      icon: <Cusotmer className="size-6" />,
      title: 'Intelligent Contract Guarantee',
      desc: 'Utilize smart contracts to realize automated settlement, ensuring the rights and interests of both parties and absolutely avoiding issues of commission and fake traffic.',
    },
    {
      icon: <LineChart className="size-6" />,
      title: 'Transparent Data Tracking',
      desc: 'Real-time monitoring of promotion results, providing on-chain verifiable data reports, ensuring every cent invested has traceable feedback.',
    },
    {
      icon: <FeiJi className="size-6" />,
      title: 'AI Content Generation Assistant',
      desc: 'Intelligently generate promotion proposals that fit the Web3 environment, supporting multiple languages and platforms, improving content quality.',
    },
    {
      icon: <Cusotmer className="size-6" />,
      title: 'KOL Credit Rating System',
      desc: 'Comprehensive scoring system based on historical performance, fan quality, and community contribution, helping project parties identify high-quality KOLs.',
    },
    {
      icon: <LineChart className="size-6" />,
      title: 'Multidimensional Ranking List',
      desc: 'Offering rankings based on popularity, growth, professionalism, and other dimensions to help projects quickly find suitable promotion partners.',
    },
  ];

  return (
    <div className="box-border w-full space-y-4 px-5 py-20 sm:mx-auto md:max-w-240">
      <div className="text-4xl leading-tight font-bold">Linkol Core Features</div>
      <div className="text-base leading-normal">
        <p>
          Linkol provides a comprehensive suite of tools designed to maximize your Web3 project's
        </p>
        <p>visibility and impact.</p>
      </div>

      <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            whileHover={{
              scale: 1.02,
              transition: { type: 'spring', stiffness: 250 },
            }}
            className="box-border cursor-pointer space-y-3 rounded-lg border border-[#DBE0E5] p-4 shadow-sm dark:border-[#DBE0E5]/20"
          >
            {card.icon}
            <div>
              <div className="text-base font-bold">{card.title}</div>
              <div className="text-md text-[#637387]">{card.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
