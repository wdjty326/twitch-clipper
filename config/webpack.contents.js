const path = require("path");
const webpack = require("webpack");

const ASSET_PATH = process.env.ASSET_PATH || "/";

module.exports = {
  mode: "production",
  entry: {
    contents: path.resolve(
      __dirname,
	  "..",
      "src",
      "contents",
      "index.ts"
    ),
  },
  output: {
    path: path.join(__dirname, "..", "dist"),
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
    new webpack.DefinePlugin({
      "process.env.ASSET_PATH": ASSET_PATH,
    }),
  ],
};
