@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root { height: 100%; }
body { @apply bg-slate-50 text-slate-900 antialiased; font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }

@layer components {
  .input { @apply w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand; }
}
