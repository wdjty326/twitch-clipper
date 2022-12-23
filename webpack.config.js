const path = require("path");
const webpack = require("webpack");
const copyWebpackPlugin = require("copy-webpack-plugin");

const ASSET_PATH = process.env.ASSET_PATH || "/";

module.exports = {
  mode: "production",
  entry: {
    background: path.resolve(__dirname, "src", "background", "index.ts"),
    popup: path.resolve(__dirname, "src", "popup", "index.ts"),
    content: path.resolve(__dirname, "src", "content", "index.ts"),
  },
  output: {
    path: path.join(__dirname, "dist"),
    publicPath: ASSET_PATH,
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new copyWebpackPlugin({
      patterns: [{ from: "public", to: "" }],
    }),
    new webpack.DefinePlugin({
      "process.env.ASSET_PATH": ASSET_PATH,
    }),
  ],
};
