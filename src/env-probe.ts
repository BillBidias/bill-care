export const probe = () => ({
  url: Boolean(import.meta.env.VITE_SUPABASE_URL),
  key: Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
});
