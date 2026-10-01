const Handlebars = require('handlebars');
const minimist = require('minimist');
const args = minimist(process.argv.slice(2));
console.log(Handlebars.compile('Hello {{name}}')({ name: args.name || 'world' }));
const ejs = require('ejs');
const serialize = require('node-serialize');
const _ = require('lodash');
console.log(ejs.render('<%= x %>', { x: 1 }), serialize.serialize({ a: 1 }), _.merge({}, args));
