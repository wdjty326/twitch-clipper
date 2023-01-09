const path = require("path");
const webpack = require("webpack");
const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

const ansiColors = {
  red: "00FF00",
};
const overlayStyles = {
  color: "#FF0000",
};

module.exports = merge(common, {
  entry: {
    contents:
      process.env.NODE_ENV === "development"
        ? [
            "webpack-hot-middleware/client?path=/__contents&timeout=20000&reload=true&ansiColors=" +
              encodeURIComponent(JSON.stringify(ansiColors)) +
              "&overlayStyles=" +
              encodeURIComponent(JSON.stringify(overlayStyles)),
            path.resolve(__dirname, "..", "src", "contents", "index.ts"),
          ]
        : path.resolve(__dirname, "..", "src", "contents", "index.ts"),
  },
  devtool: process.env.NODE_ENV === "development" ? false : "source-map",
  plugins:
    process.env.NODE_ENV === "development"
      ? [new webpack.HotModuleReplacementPlugin()]
      : [],
});
