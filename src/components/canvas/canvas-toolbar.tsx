"use client";

import {
  Type,
  StickyNote,
  ArrowUpRight,
  Link2,
  Frame,
  Pencil,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Copy,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function CanvasToolbar({
  drawMode,
  onToggleDraw,
  onAdd,
  onZoomIn,
  onZoomOut,
  onResetView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  hasSelection,
  onDuplicateSelection,
  onDeleteSelection,
}: {
  drawMode: boolean;
  onToggleDraw: () => void;
  onAdd: (kind: "text" | "sticky" | "arrow" | "link" | "group") => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  onDuplicateSelection: () => void;
  onDeleteSelection: () => void;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-md">
      <Button variant="ghost" size="icon-sm" aria-label="Adicionar texto" onClick={() => onAdd("text")}>
        <Type className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Adicionar nota" onClick={() => onAdd("sticky")}>
        <StickyNote className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Adicionar seta" onClick={() => onAdd("arrow")}>
        <ArrowUpRight className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Adicionar link" onClick={() => onAdd("link")}>
        <Link2 className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Adicionar grupo" onClick={() => onAdd("group")}>
        <Frame className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Desenhar"
        aria-pressed={drawMode}
        onClick={onToggleDraw}
        className={cn(drawMode && "bg-sidebar-accent text-electric-blue")}
      >
        <Pencil className="size-4" />
      </Button>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Button variant="ghost" size="icon-sm" aria-label="Desfazer" onClick={onUndo} disabled={!canUndo}>
        <Undo2 className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Refazer" onClick={onRedo} disabled={!canRedo}>
        <Redo2 className="size-4" />
      </Button>

      <Separator orientation="vertical" className="mx-0.5 h-5" />

      <Button variant="ghost" size="icon-sm" aria-label="Diminuir zoom" onClick={onZoomOut}>
        <ZoomOut className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Aumentar zoom" onClick={onZoomIn}>
        <ZoomIn className="size-4" />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Centralizar" onClick={onResetView}>
        <Maximize className="size-4" />
      </Button>

      {hasSelection ? (
        <>
          <Separator orientation="vertical" className="mx-0.5 h-5" />
          <Button variant="ghost" size="icon-sm" aria-label="Duplicar seleção" onClick={onDuplicateSelection}>
            <Copy className="size-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" aria-label="Excluir seleção" onClick={onDeleteSelection}>
            <Trash2 className="size-4" />
          </Button>
        </>
      ) : null}
    </div>
  );
}
