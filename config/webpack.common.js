const path = require("path");
const webpack = require("webpack");

const ASSET_PATH = process.env.ASSET_PATH || "/";
const NODE_ENV = process.env.NODE_ENV || "production";

const outputPath =
  NODE_ENV === "development"
    ? path.join(__dirname, "..", "test")
    : path.join(__dirname, "..", "dist");

const tsconfigFileName =
  NODE_ENV === "development" ? "tsconfig.dev.json" : "tsconfig.json"; // vscode에서 tsconfig 설정 참조변경이 없음

module.exports = {
  mode: NODE_ENV,
  output: {
    path: outputPath,
    publicPath: ASSET_PATH,
    filename: "[name].js",
    chunkFilename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    modules: [path.resolve(__dirname, "src"), "node_modules"],
    alias: {
      "@": path.resolve(__dirname, "..", "src"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: {
          configFile: tsconfigFileName,
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.ASSET_PATH": ASSET_PATH,
    }),
  ],
};
