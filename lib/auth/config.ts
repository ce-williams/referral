export type AuthMode = "disabled" | "enabled";

export function getAuthMode(): AuthMode {
  const mode = process.env.AUTH_MODE ?? (process.env.NODE_ENV === "production" ? "enabled" : "disabled");
  if (mode !== "disabled" && mode !== "enabled") throw new Error("AUTH_MODE must be either 'disabled' or 'enabled'.");
  if (process.env.NODE_ENV === "production" && mode === "disabled") {
    throw new Error("Authentication is required for production. Configure an auth provider before deploying.");
  }
  return mode;
}

export interface AuthProvider {
  currentUser(): Promise<{ id: string; email?: string } | null>;
}

