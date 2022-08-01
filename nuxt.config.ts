import { defineNuxtConfig } from 'nuxt'
// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    runtimeConfig: {
        baseURL: process.env.BASE_URL
    },
    modules: [
        './modules/mongodb.setup',
    ],
    build: {
        transpile: ['./modules/mongodb.setup'],
    }
})
