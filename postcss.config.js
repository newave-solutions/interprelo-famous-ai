export default (ctx) => ({
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // Apply cssnano only in production builds
    ...(ctx.env === 'production' ? { cssnano: { preset: 'default' } } : {}),
  },
})
