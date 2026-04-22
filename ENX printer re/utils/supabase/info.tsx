const env = import.meta.env as Record<string, string | undefined>;

const defaultProjectId = "omqsbenvwyemjbmqgrqw";
const defaultAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tcXNiZW52d3llbWpibXFncnF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTIyMDAsImV4cCI6MjA4NjE4ODIwMH0.0BcO4B74LDz2DXO6e4H5FOKyw0GAIzJ_wmnKUl8TbJA";

const inferProjectIdFromUrl = (url?: string) => {
  if (!url) return undefined;
  try {
    return new URL(url).hostname.split(".")[0];
  } catch {
    return undefined;
  }
};

export const projectId =
  env.VITE_SUPABASE_PROJECT_ID ||
  inferProjectIdFromUrl(env.VITE_SUPABASE_URL) ||
  defaultProjectId;

export const publicAnonKey =
  env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  env.VITE_SUPABASE_ANON_KEY ||
  defaultAnonKey;