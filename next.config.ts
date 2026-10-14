import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_PAGES === "true";
const authMode = process.env.AUTH_MODE ?? (process.env.NODE_ENV === "production" && !isGitHubPagesBuild ? "enabled" : "disabled");

if (process.env.NODE_ENV === "production" && !isGitHubPagesBuild) {
  throw new Error("Referral is a local prototype. Production builds remain disabled until a real authentication provider and server-side data authorization are implemented.");
}

if (authMode === "enabled") {
  throw new Error("AUTH_MODE=enabled is not available yet. Implement and configure the Supabase Auth provider before enabling login.");
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  ...(isGitHubPagesBuild
    ? {
        output: "export" as const,
        basePath: "/referral",
        trailingSlash: true,
      }
    : {}),
};

export default nextConfig;
