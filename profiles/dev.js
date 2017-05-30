import config from './base';

config.dest = `dist/${config.moduleName}.js`;
config.format = 'umd';
config.sourceMap = `dist/${config.moduleName}.umd.js.map`;

export default config;
