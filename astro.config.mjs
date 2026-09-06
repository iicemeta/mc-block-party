// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // 默认 output: 'static'：页面全部预渲染为静态资源（免费、不计 Workers 请求），
  // src/pages/api/** 下的接口路由通过 export const prerender = false 按需渲染（走 Worker）。
  adapter: cloudflare(),
  integrations: [react()]
});
