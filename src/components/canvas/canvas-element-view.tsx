"use client";

import * as React from "react";
import { ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { CanvasElement } from "@/lib/canvas/types";
import { cn } from "@/lib/utils";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function CanvasElementContent({
  element,
  editing,
  onCommitText,
  onCommitUrl,
  onStartEdit,
}: {
  element: CanvasElement;
  editing: boolean;
  onCommitText: (value: string) => void;
  onCommitUrl: (url: string, title: string) => void;
  onStartEdit: () => void;
}) {
  if (element.type === "text") {
    if (editing) {
      return (
        <textarea
          autoFocus
          defaultValue={element.content}
          onBlur={(e) => onCommitText(e.target.value)}
          className="size-full resize-none border-none bg-transparent p-2 text-body text-foreground outline-none"
        />
      );
    }
    return (
      <div onDoubleClick={onStartEdit} className="size-full whitespace-pre-wrap p-2 text-body text-foreground">
        {element.content || <span className="text-muted-foreground">Duplo clique para editar...</span>}
      </div>
    );
  }

  if (element.type === "sticky") {
    return (
      <div
        className="size-full rounded-lg p-3 shadow-subtle"
        style={{ backgroundColor: element.color }}
        onDoubleClick={onStartEdit}
      >
        {editing ? (
          <textarea
            autoFocus
            defaultValue={element.content}
            onBlur={(e) => onCommitText(e.target.value)}
            className="size-full resize-none border-none bg-transparent text-body text-charcoal outline-none"
          />
        ) : (
          <div className="size-full whitespace-pre-wrap text-body text-charcoal">
            {element.content || <span className="opacity-50">Nota...</span>}
          </div>
        )}
      </div>
    );
  }

  if (element.type === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={element.src} alt="" className="size-full rounded-lg object-cover" draggable={false} />;
  }

  if (element.type === "drawing") {
    const points = element.points.map((p) => `${p.x},${p.y}`).join(" ");
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${element.width} ${element.height}`} className="overflow-visible">
        <polyline points={points} fill="none" stroke={element.color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (element.type === "arrow") {
    const markerId = `arrowhead-${element.id}`;
    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${element.width || 1} ${element.height || 1}`} className="overflow-visible">
        <defs>
          <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill={element.color} />
          </marker>
        </defs>
        <line x1={0} y1={0} x2={element.width} y2={element.height} stroke={element.color} strokeWidth={2.5} markerEnd={`url(#${markerId})`} />
      </svg>
    );
  }

  if (element.type === "link") {
    if (editing || !element.url) {
      return (
        <div className="flex size-full flex-col gap-1.5 rounded-lg border border-border bg-card p-2.5">
          <Input
            autoFocus
            defaultValue={element.url}
            placeholder="Cole um link (Pinterest, Instagram, Behance, YouTube...)"
            onBlur={(e) => onCommitUrl(e.target.value, element.title ?? "")}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
        </div>
      );
    }
    return (
      <a
        href={element.url}
        target="_blank"
        rel="noreferrer"
        onDoubleClick={(e) => {
          e.preventDefault();
          onStartEdit();
        }}
        className="flex size-full flex-col justify-center gap-1 rounded-lg border border-border bg-card p-3 hover:border-electric-blue/40"
      >
        <span className="flex items-center gap-1.5 text-body font-medium text-electric-blue">
          <ExternalLink className="size-3.5 shrink-0" />
          {element.title || hostnameOf(element.url)}
        </span>
        <span className="truncate text-caption text-muted-foreground">{element.url}</span>
      </a>
    );
  }

  // group
  return (
    <div className="size-full rounded-xl border-2 border-dashed border-smoke bg-transparent">
      <span className="absolute -top-6 left-0 text-caption font-medium text-muted-foreground">{element.label}</span>
    </div>
  );
}

export function elementBaseClassName(element: CanvasElement, selected: boolean): string {
  return cn(
    "absolute",
    element.type !== "group" && element.type !== "drawing" && element.type !== "arrow" && "cursor-move",
    selected && "ring-2 ring-electric-blue ring-offset-2 ring-offset-transparent"
  );
}
