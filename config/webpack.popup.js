const path = require("path");
const { merge } = require("webpack-merge");
const { globSync } = require("glob");

const common = require("./webpack.common.js");

const copyWebpackPlugin = require("copy-webpack-plugin");
const htmlWebpackPlugin = require("html-webpack-plugin");
const miniCssExtractPlugin = require("mini-css-extract-plugin");

const entry = {};
const htmlWebpackPlugins = [];
globSync("src/renderer/routes/*/index.tsx").forEach((filePath) => {
  const relativePath = filePath.substring(20);
  const key = relativePath.substring(0, relativePath.indexOf("\\"));
  entry[key] = path.resolve(
    __dirname,
    "..",
    "src",
    "renderer",
    "routes",
    relativePath
  );

  htmlWebpackPlugins.push(
    new htmlWebpackPlugin({
      filename: key + ".html",
      template: path.resolve(__dirname, "..", "index.html"),
      chunks: [key, "runtime"],
      minify: false,
      inject: false,
    })
  );
});

module.exports = merge(
  common,
  {
    entry,
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
          runtime: {
            name: "runtime",
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
        chunkFilename: "[name].css",
      }),
      new copyWebpackPlugin({
        patterns: [
          {
            from: path.resolve(__dirname, "..", "public"),
            to: "",
          },
        ],
      }),
      ...htmlWebpackPlugins,
    ],
  },
  {
    performance: {
      hints: false,
      //  hints: "warning",
      //  maxAssetSize: 1512000,
      //  maxEntrypointSize: 1512000,
    },
  }
);
