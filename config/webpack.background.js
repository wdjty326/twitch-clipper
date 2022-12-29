const path = require("path");
const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

module.exports = merge(common, {
  entry: {
    background: path.resolve(__dirname, "..", "src", "background", "index.ts"),
  },
});
