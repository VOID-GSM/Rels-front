export const ROLE = {
  STUDENT: "STUDENT",
  COUNCIL: "COUNCIL",
} as const;

export type Role = (typeof ROLE)[keyof typeof ROLE];
