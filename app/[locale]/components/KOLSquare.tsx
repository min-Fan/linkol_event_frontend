import CompFilter from './Filter';
import CompKOLSquareList from './KOLSquareList';

export default function KOLSquare() {
  return (
    <div className="relative">
      <div className="space-y-2 sm:space-y-5">
        <CompFilter />
        <CompKOLSquareList />
      </div>
    </div>
  );
}
