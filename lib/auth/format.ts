export const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  nutricionista: "Nutricionista",
  lider: "Líder",
};

export function getInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}
