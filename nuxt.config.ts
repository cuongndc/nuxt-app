import { defineNuxtConfig } from 'nuxt'
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    runtimeConfig: {
        baseURL: process.env.BASE_URL
    },
    modules: ['nuxt-proxy'],
    proxy: {
        options: {
            target:  process.env.BASE_URL,
            changeOrigin: true,
            pathRewrite: {
                '^/api/': '/api/',
            },
            pathFilter: [
                '/api/'
            ]
        }
    }
})
