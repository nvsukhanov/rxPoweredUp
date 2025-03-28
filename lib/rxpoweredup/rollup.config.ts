import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const CONFIG = defineConfig({
  input: 'src/index.ts',
  output: [
    {
      format: 'esm',
      file: '../../dist/rxpoweredup/rxpoweredup.min.js',
      plugins: [terser()],
    },
  ],
  plugins: [
    resolve(),
    typescript({
      tsconfig: 'tsconfig.lib.json',
      sourceMap: false,
    }),
  ],
});

export default CONFIG;
