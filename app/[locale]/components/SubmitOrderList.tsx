import { ScrollArea } from '@shadcn/components/ui/scroll-area';
import CompSubmitOrderListItem from './SubmitOrderListItem';
import { useAppSelector } from '@store/hooks';

export default function SubmitOrderList() {
  const selectedKOLs = useAppSelector((state) => state.userReducer?.selectedKOLs);
  return (
    <ScrollArea className="">
      <div className="grid max-h-[530px] grid-cols-3 gap-4">
        {selectedKOLs?.map((kol) => (
          <CompSubmitOrderListItem key={kol.id} kol={kol} />
        ))}
      </div>
    </ScrollArea>
  );
}
