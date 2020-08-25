module.exports = {
    apps : [{
      script: 'server.js',
      watch: '.',
      ignore_watch : ["node_modules", "log"],
      watch_options: {
        "followSymlinks": false
      }
    }],
  };
  