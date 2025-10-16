import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

const isDevelopment = process.env.BUILD === 'development';
const isProduction = process.env.BUILD === 'production';

// Common plugins configuration
const commonPlugins = [
  resolve({
    browser: true,
    preferBuiltins: false
  }),
  commonjs(),
  babel({
    babelHelpers: 'bundled',
    exclude: 'node_modules/**',
    presets: [
      ['@babel/preset-env', {
        targets: {
          browsers: ['Chrome >= 60', 'Firefox >= 60', 'Safari >= 12', 'Edge >= 79']
        },
        modules: false
      }]
    ]
  })
];

// Add terser for production builds
const productionPlugins = isProduction ? [terser()] : [];

// Sourcemap configuration
const sourcemap = isDevelopment || !isProduction;

// Bundle configurations
const configs = [
  // Single bundle - CJS (CommonJS/UMD for CDN)
  {
    input: 'src/v2/js/asteronote.js',
    output: {
      file: 'dist/v2/asteronote.js',
      format: 'umd',
      name: 'AsteroNote',
      exports: 'named',
      sourcemap
    },
    plugins: [...commonPlugins, ...productionPlugins]
  },
  // Single bundle - ESM (for modern bundlers and import)
  {
    input: 'src/v2/js/asteronote.js',
    output: {
      file: 'dist/v2/asteronote.esm.js',
      format: 'es',
      sourcemap
    },
    plugins: [...commonPlugins, ...productionPlugins]
  }
];

export default configs;
