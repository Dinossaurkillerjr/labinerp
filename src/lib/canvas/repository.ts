import type { AnySupabaseClient } from "@/lib/supabase/types";
import { createClient } from "@/lib/supabase/client";
import type { CanvasElement } from "./types";

// One polymorphic table: common geometry as columns, type-specific fields
// (content/color/src/points/url/title/label) in `data` — exactly mirroring
// the CanvasElement discriminated union, so no per-type table is needed.
type CanvasElementRow = {
  id: string;
  user_id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  z_index: number;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

function rowToElement(row: CanvasElementRow): CanvasElement {
  return {
    id: row.id,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    zIndex: row.z_index,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    type: row.type,
    ...row.data,
  } as CanvasElement;
}

function elementToRow(userId: string, element: CanvasElement): CanvasElementRow {
  const { id, x, y, width, height, zIndex, createdAt, updatedAt, type, ...rest } = element;
  return {
    id,
    user_id: userId,
    type,
    x,
    y,
    width,
    height,
    z_index: zIndex,
    data: rest,
    created_at: createdAt,
    updated_at: updatedAt,
  };
}

export async function fetchCanvasElements(userId: string): Promise<CanvasElement[]> {
  const { data, error } = await createClient().from("canvas_elements").select("*").eq("user_id", userId);
  if (error) throw error;
  return (data as CanvasElementRow[]).map(rowToElement);
}

export async function upsertCanvasElements(
  userId: string,
  elements: CanvasElement[],
  client: AnySupabaseClient = createClient()
): Promise<void> {
  if (elements.length === 0) return;
  const { error } = await client.from("canvas_elements").upsert(elements.map((el) => elementToRow(userId, el)));
  if (error) throw error;
}

export async function deleteCanvasElements(userId: string, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await createClient().from("canvas_elements").delete().eq("user_id", userId).in("id", ids);
  if (error) throw error;
}
