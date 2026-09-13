"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag } from "@/components/common/tag";
import { TAG_COLOR_OPTIONS, type EntityTag, type TagColor } from "@/lib/tags";
import { cn } from "@/lib/utils";

const COLOR_SWATCH: Record<TagColor, string> = {
  neutral: "bg-silver",
  blue: "bg-electric-blue",
  green: "bg-vivid-green",
  orange: "bg-tangerine",
  violet: "bg-lavender",
};

let localCounter = 0;
function tempId() {
  localCounter += 1;
  return `tag-${Date.now()}-${localCounter}`;
}

/** Small, reusable multi-tag editor — used by Contatos (CRM) and Tarefas. */
export function TagsEditor({
  tags,
  onChange,
  suggestions = [],
}: {
  tags: EntityTag[];
  onChange: (tags: EntityTag[]) => void;
  /** Quick-add labels shown below the input, e.g. common CRM tags. */
  suggestions?: string[];
}) {
  const [label, setLabel] = React.useState("");
  const [color, setColor] = React.useState<TagColor>("blue");

  function addTag(newLabel: string) {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.label.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...tags, { id: tempId(), label: trimmed, color }]);
    setLabel("");
  }

  function removeTag(id: string) {
    onChange(tags.filter((t) => t.id !== id));
  }

  const availableSuggestions = suggestions.filter(
    (s) => !tags.some((t) => t.label.toLowerCase() === s.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-2">
      {tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <Tag key={tag.id} color={tag.color} className="gap-1 pr-1.5">
              {tag.label}
              <button type="button" onClick={() => removeTag(tag.id)} aria-label={`Remover tag ${tag.label}`}>
                <X className="size-3" />
              </button>
            </Tag>
          ))}
        </div>
      ) : null}

      <div className="flex items-center gap-1.5">
        {TAG_COLOR_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            aria-label={`Cor ${option}`}
            onClick={() => setColor(option)}
            className={cn(
              "size-5 rounded-full ring-offset-2",
              COLOR_SWATCH[option],
              color === option && "ring-2 ring-foreground"
            )}
          />
        ))}
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nova tag..."
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(label);
            }
          }}
        />
        <Button variant="outline" size="icon" type="button" onClick={() => addTag(label)} aria-label="Adicionar tag">
          <Plus className="size-4" />
        </Button>
      </div>

      {availableSuggestions.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {availableSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="rounded-full border border-dashed border-border px-2.5 py-0.5 text-caption text-muted-foreground hover:border-electric-blue/40 hover:text-foreground"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
