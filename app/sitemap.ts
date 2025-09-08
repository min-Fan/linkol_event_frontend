// app/sitemap.ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://www.linkol.ai/', lastModified: new Date() },
    { url: 'https://www.linkol.ai/zh', lastModified: new Date() },
    { url: 'https://www.linkol.ai/en', lastModified: new Date() },
    { url: 'https://www.linkol.ai/en/landing', lastModified: new Date() },
    { url: 'https://www.linkol.ai/zh/landing', lastModified: new Date() },
  ];
}
