import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import vercel from '@astrojs/vercel';
import { loadEnv } from 'vite';

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

export default defineConfig({
  site: 'https://kds-handwerk.de',
  output: 'server',
  adapter: vercel(),
  redirects: {
    '/home': '/',
  },
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      apiOptions: { region: 'eu' },
      componentsDir: 'src/components',
      components: {
        page: 'storyblok/Page',
        hero: 'storyblok/Hero',
        services: 'storyblok/Services',
        service_card: 'storyblok/ServiceCard',
        projects: 'storyblok/Projects',
        project_card: 'storyblok/ProjectCard',
        about: 'storyblok/About',
        about_feature: 'storyblok/AboutFeature',
        cta_section: 'storyblok/CtaSection',
        contact: 'storyblok/Contact',
      },
    }),
  ],
});
