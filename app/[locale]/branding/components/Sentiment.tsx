import CompGoodSentiment from './GoodSentiment';
import CompBadSentiment from './BadSentiment';

export default function Sentiment() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <CompGoodSentiment />
      <CompBadSentiment />
    </div>
  );
}
