import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function SpinnerButton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button disabled className="h-8 px-3 text-xs">
        <Spinner />
        Loading...
      </Button>
      <Button variant="outline" disabled className="h-8 px-3 text-xs">
        <Spinner />
        Please wait
      </Button>
      <Button variant="default" disabled className="h-8 px-3 text-xs">
        <Spinner />
        Processing
      </Button>
    </div>
  );
}
