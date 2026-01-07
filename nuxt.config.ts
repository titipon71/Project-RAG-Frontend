// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/content",
    "@nuxt/image",
    "@nuxt/scripts",
    "@nuxt/ui",
    "@nuxt/eslint",
    "@nuxt/hints",
    "@pinia/nuxt",
  ],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBase: "",
    },
  },
});
