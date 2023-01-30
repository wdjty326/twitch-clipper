const path = require("path");
const webpack = require("webpack");

const ASSET_PATH = process.env.ASSET_PATH || "/";
const NODE_ENV = process.env.NODE_ENV || "production";

module.exports = {
  mode: NODE_ENV,
  output: {
    path: path.join(__dirname, "..", "dist"),
    publicPath: ASSET_PATH,
    filename: "[name].js",
	chunkFilename: "[name].js",
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
    new webpack.DefinePlugin({
      "process.env.ASSET_PATH": ASSET_PATH,
    }),
  ],
};
