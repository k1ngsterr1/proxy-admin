import type { User } from "../../types";

export function filterUsers(users: User[], searchTerm: string): User[] {
  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  if (!normalizedSearchTerm) {
    return users;
  }

  return users.filter(
    (user) =>
      user.id.toLowerCase().includes(normalizedSearchTerm) ||
      user.email.toLowerCase().includes(normalizedSearchTerm) ||
      user.name?.toLowerCase().includes(normalizedSearchTerm) ||
      user.ip.includes(normalizedSearchTerm),
  );
}
