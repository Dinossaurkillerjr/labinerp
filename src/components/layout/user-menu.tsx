"use client";

import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSupabaseUser } from "@/lib/supabase/use-supabase-user";
import { signOutAction } from "@/app/login/actions";

export function UserMenu() {
  const { email } = useSupabaseUser();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Conta">
          <User className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {email ? <DropdownMenuLabel className="font-normal text-muted-foreground">{email}</DropdownMenuLabel> : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onSelect={() => signOutAction()}>
          <LogOut /> Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
