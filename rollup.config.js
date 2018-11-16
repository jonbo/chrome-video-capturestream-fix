import { terser } from "rollup-plugin-terser";

export default [
  {
    input: "src/index.js",
    output: {
      name: "VideoCaptureStreamFix",
      file: "dist/videoCaptureStreamFix.umd.js",
      format: "umd",
      sourcemap: true,
    },
    plugins: [],
  },
  {
    input: "src/index.js",
    output: {
      name: "VideoCaptureStreamFix",
      file: "dist/videoCaptureStreamFix.umd.min.js",
      format: "umd",
      sourcemap: true,
    },
    plugins: [terser()],
  },
];
