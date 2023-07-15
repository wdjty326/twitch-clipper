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
  entry: path.resolve(__dirname, "..", "src", "main", "index.ts"),
});
