import { add } from "@workspace/math/add";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Widget Application</h1>
        <Button size="sm">Button</Button>
        <p>{add(2, 2)}</p>
        <Input />
      </div>
    </div>
  );
}
