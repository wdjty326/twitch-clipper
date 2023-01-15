const path = require("path");
const { merge } = require("webpack-merge");

const common = require("./webpack.common.js");

const copyWebpackPlugin = require("copy-webpack-plugin");
const htmlWebpackPlugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = merge(
  common,
  {
    entry: {
      popup: path.resolve(__dirname, "..", "src", "popup", "index.tsx"),
    },
    module: {
      rules: [
        {
          test: /\.css$/i,
          use: [miniCssExtractPlugin.loader, "css-loader"],
        },
      ],
    },
    optimization: {
      splitChunks: {
        chunks: "all",
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
    plugins: [
      new miniCssExtractPlugin({
        linkType: "text/css",
        filename: "[name].css",
        chunkFilename: "[name].[id].css",
      }),
      new copyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "..", "public"),
            to: "",
          },
        ],
      }),
      new htmlWebpackPlugin({
        filename: "index.html",
        template: path.resolve(__dirname, "..", "index.html"),
      }),
    ],
  },
  {
    performance: {
      hints: "warning",
      maxAssetSize: 1512000,
      maxEntrypointSize: 1512000,
    },
  }
);
