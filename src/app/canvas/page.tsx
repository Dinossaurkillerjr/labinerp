"use client";

import dynamic from "next/dynamic";
import { PageHeader } from "@/components/common/page-header";
import { CanvasProvider } from "@/lib/canvas/canvas-provider";
import { Skeleton } from "@/components/ui/skeleton";

// The board's pointer/drag/zoom logic is only ever needed on this page, so
// it's kept out of the app's shared bundle and fetched on demand.
const CanvasBoard = dynamic(
  () => import("@/components/canvas/canvas-board").then((mod) => mod.CanvasBoard),
  { ssr: false, loading: () => <Skeleton className="h-full w-full rounded-xl" /> }
);

export default function CanvasPage() {
  return (
    <div className="flex flex-1 flex-col gap-4">
      <PageHeader
        title="Canvas"
        description="Espaço livre para pensar, reunir referências e organizar ideias visualmente."
      />
      <div className="h-[calc(100vh-220px)] min-h-[520px]">
        <CanvasProvider>
          <CanvasBoard />
        </CanvasProvider>
      </div>
    </div>
  );
}
