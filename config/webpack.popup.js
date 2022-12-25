const path = require("path");
const webpack = require("webpack");

const copyWebpackPlugin = require("copy-webpack-plugin");
const htmlWebpackPlugin = require("html-webpack-plugin");

const ASSET_PATH = process.env.ASSET_PATH || "/";

module.exports = {
  mode: "production",
  entry: {
    popup: path.resolve(__dirname, "..", "src", "popup", "index.tsx"),
  },
  output: {
    path: path.join(__dirname, "..", "dist"),
    publicPath: ASSET_PATH,
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
  },
  optimization: {
    splitChunks: {
      chunks: "async",
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      enforceSizeThreshold: 50000,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
        },
      },
    },
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
      patterns: [
        {
          from: path.resolve(__dirname, "..", "public", "manifest.json"),
          to: "",
        },
        {
          from: path.resolve(__dirname, "..", "public", "icon-32.png"),
          to: "",
        },
      ],
    }),
    new webpack.DefinePlugin({
      "process.env.ASSET_PATH": ASSET_PATH,
    }),
    new htmlWebpackPlugin({
      filename: "index.html",
      template: path.resolve(__dirname, "..", "public", "index.html"),
    }),
  ],
};
