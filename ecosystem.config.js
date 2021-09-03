module.exports = {
  apps: [
    {
      name: "api",
      script: "./api/.dist/api.js",
    },
    {
      name: "web",
      script: "serve",
      env: {
        PM2_SERVE_PATH: "./web",
        PM2_SERVE_PORT: 9999,
        PM2_SERVE_SPA: true,
      },
    },
  ]
}
