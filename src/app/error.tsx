"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/common/error-state";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center">
      <ErrorState
        title="Algo deu errado nesta página"
        description="Tente novamente. Se o problema continuar, recarregue o aplicativo."
        onRetry={reset}
        className="max-w-md"
      />
    </div>
  );
}
