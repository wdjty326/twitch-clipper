const path = require("path");
const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  entry: {
    contents: path.resolve(__dirname, "..", "src", "contents", "index.ts"),
  },
});
