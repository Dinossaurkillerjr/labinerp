"use client";

import { PageHeader } from "@/components/common/page-header";
import { CanvasProvider } from "@/lib/canvas/canvas-provider";
import { CanvasBoard } from "@/components/canvas/canvas-board";

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
