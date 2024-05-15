export const twGrays = ["slate", "gray", "zinc", "neutral", "stone"] as const;

export const twColors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
] as const;

export type colorVariant =
  | "default"
  | `dark-${(typeof twGrays)[number]}`
  | (typeof twGrays)[number]
  | (typeof twColors)[number];
