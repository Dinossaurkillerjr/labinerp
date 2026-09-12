"use client";

import * as React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateInput({
  value,
  onValueChange,
  placeholder = "Selecionar data",
  className,
}: {
  value?: Date;
  onValueChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-8 w-full justify-start gap-2 rounded-md font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4" />
          {value ? format(value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onValueChange(date);
            setOpen(false);
          }}
          locale={ptBR}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
