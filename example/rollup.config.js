import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  input: '../es/index.js',
  output: {
    file: './dist/bundle.js',
    format: 'umd',
    name: 'mp4filechecker',
    sourcemap: true,
  },
  context: 'window',
  plugins: [
    resolve(),
    commonjs(),
  ],
};
