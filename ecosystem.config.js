module.exports = {
  apps: [
    {
      name: "api",
      script: "./api/.dist/api.js",
      watch: ["./api/.dist"],
      instances: 1,
      exec_mode: "cluster",
    },
    {
      name: "web",
      script: "serve",
      watch: ["./web/.dist", "./web/index.html"],
      env: {
        PM2_SERVE_PATH: "./web",
        PM2_SERVE_PORT: 9999,
        PM2_SERVE_SPA: true,
      },
    },
  ]
}
