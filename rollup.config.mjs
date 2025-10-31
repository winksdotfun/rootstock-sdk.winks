import path from 'node:path';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.mjs', format: 'esm', sourcemap: true },
  ],
  external: [
    'react',
    'react-dom',
    'axios',
    'ethers',
    'wagmi',
    '@rainbow-me/rainbowkit',
  ],
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    json(),
    typescript({ tsconfig: path.resolve('./tsconfig.json'), declaration: true, declarationDir: 'dist', outDir: 'dist' }),
  ],
};


