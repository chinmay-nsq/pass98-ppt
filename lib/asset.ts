/**
 * Prefixes a /public asset path with the deploy base path. GitHub Pages serves a project site from
 * a sub-path (/<repo>/), and Next only rewrites its own bundles under basePath, not raw URLs in code.
 * NEXT_PUBLIC_BASE_PATH is set in next.config.ts and is empty for local dev.
 */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${path}`;
