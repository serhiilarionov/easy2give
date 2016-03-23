var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'easy2give'
    },
    port: 3000,
    db: 'mongodb://localhost/easy2give-development'
  },

  test: {
    root: rootPath,
    app: {
      name: 'easy2give'
    },
    port: 3000,
    db: 'mongodb://localhost/easy2give-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'easy2give'
    },
    port: 3000,
    db: 'mongodb://localhost/easy2give-production'
  }
};

module.exports = config[env];
