export enum PredictionSide {
  YES = 'YES',
  NO = 'NO',
}

export interface KOL {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  verified?: boolean;
}

export interface ChartDataPoint {
  time: string;
  price: number;
  kols?: Array<{
    user: KOL;
    side: PredictionSide;
    action: string;
  }>;
}

export interface Comment {
  id: string;
  user: KOL;
  content: string;
  timestamp: string;
  side?: PredictionSide;
  likes: number;
}

export interface TradeActivity {
  id: string;
  user: KOL;
  side: PredictionSide;
  shares: number;
  amount: number;
  timestamp: string;
}

export interface TopVoice {
  user: KOL;
  side: PredictionSide;
  amount: number;
  influenceScore: number;
}

export interface Market {
  id: string;
  kol: KOL;
  question: string;
  tweetContent: string;
  tweetDate: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  commentsCount: number;
  isTrending?: boolean;
  endDate: string;
  rules?: string;
  chartData: ChartDataPoint[];
  comments: Comment[];
  activities: TradeActivity[];
  topVoices: TopVoice[];
  yesVoiceVolume: number;
  noVoiceVolume: number;
  yesParticipantCount: number;
  noParticipantCount: number;
}
