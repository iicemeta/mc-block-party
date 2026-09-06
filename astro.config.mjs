// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // 默认 output: 'static'：页面全部预渲染为静态资源（免费、不计 Workers 请求），
  // src/pages/api/** 下的接口路由通过 export const prerender = false 按需渲染（走 Worker）。
  adapter: cloudflare({
    // 本站图片均为 public/ 下的静态文件直接引用，不使用 astro:assets 转换，
    // passthrough 避免适配器自动注入 Cloudflare Images 绑定
    imageService: 'passthrough'
  }),
  integrations: [react()],
  // 鉴权为 melody auth JWT（无状态），不使用 Astro 服务端 session，
  // 显式关闭以避免适配器自动注入 SESSION KV 绑定
  session: false
});
