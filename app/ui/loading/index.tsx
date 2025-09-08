import { LoaderCircle } from 'lucide-react';

export default function UILoading() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoaderCircle className="text-muted-foreground h-10 w-10 animate-spin" />
    </div>
  );
}
