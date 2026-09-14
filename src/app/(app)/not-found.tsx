import { FileQuestion } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";

export default function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <EmptyState
        icon={FileQuestion}
        title="Página não encontrada"
        description="A página que você procura não existe ou foi movida."
        className="max-w-md"
        action={
          <Button asChild>
            <Link href="/">Voltar ao início</Link>
          </Button>
        }
      />
    </div>
  );
}
