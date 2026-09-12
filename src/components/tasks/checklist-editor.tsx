"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { ChecklistItem } from "@/lib/tasks/types";

let localCounter = 0;
function tempId() {
  localCounter += 1;
  return `chk-${Date.now()}-${localCounter}`;
}

export function ChecklistEditor({
  items,
  onChange,
}: {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
}) {
  const [newLabel, setNewLabel] = React.useState("");

  function addItem() {
    if (!newLabel.trim()) return;
    onChange([...items, { id: tempId(), label: newLabel, done: false }]);
    setNewLabel("");
  }

  function toggleItem(id: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, done: !item.done } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <Checkbox checked={item.done} onCheckedChange={() => toggleItem(item.id)} />
          <span className={item.done ? "flex-1 text-body text-muted-foreground line-through" : "flex-1 text-body text-foreground"}>
            {item.label}
          </span>
          <button onClick={() => removeItem(item.id)} type="button" aria-label="Remover item">
            <X className="size-3.5 text-muted-foreground" />
          </button>
        </div>
      ))}
      <div className="flex items-center gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Novo item..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
        />
        <Button variant="outline" size="icon" onClick={addItem} type="button" aria-label="Adicionar item">
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
