import json from '@rollup/plugin-json';
import alias from '@rollup/plugin-alias';
import typescript from 'rollup-plugin-typescript2';

export default {
  plugins: [
    json(),
    typescript(),
    alias({
      entries: [
        { find: '@', replacement: './src' },
      ]
    })
  ],
  input: 'src/index.ts',
  output: {
    file: 'bin/pv-script.js',
    format: 'esm',
  },
  external: ['commander']
}
