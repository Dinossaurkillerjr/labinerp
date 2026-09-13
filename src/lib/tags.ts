// Shared, domain-agnostic tag color palette — used by both the generic <Tag>
// display component and any entity (Contact, Task, ...) that stores its own
// user-defined tags, so there is a single source of truth for what colors
// exist instead of each domain inventing its own list.

export const TAG_COLOR_OPTIONS = ["neutral", "blue", "green", "orange", "violet"] as const;

export type TagColor = (typeof TAG_COLOR_OPTIONS)[number];

export type EntityTag = {
  id: string;
  label: string;
  color: TagColor;
};
