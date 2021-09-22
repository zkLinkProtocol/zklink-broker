module.exports = {
  apps: [{
    interpreter: './node_modules/.bin/ts-node',
    interpreter_args: '-P ./tsconfig.json ',
    cwd: './',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    },
    kill_timeout: 10000,
    name: 'broker-server',
    script: './src/index.ts',
    wait_ready: true,
    watch: false,
    // watch: ['server'],
    ignore_watch: ['node_modules'],
    watch_options: {
      "usePolling": true
    }
  }]
};