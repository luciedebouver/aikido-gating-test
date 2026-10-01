const Handlebars = require('handlebars');
const minimist = require('minimist');
const args = minimist(process.argv.slice(2));
console.log(Handlebars.compile('Hello {{name}}')({ name: args.name || 'world' }));
