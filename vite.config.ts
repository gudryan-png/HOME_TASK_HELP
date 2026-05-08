return {
  base: '/HOME_TASK_HELP/',

  plugins: [react(), tailwindcss()],

  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
}
