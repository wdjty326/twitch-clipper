const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");

const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const webpackHotMiddleware = require("webpack-hot-middleware");

const backgroundConfig = require("../config/webpack.background");
const contentsConfig = require("../config/webpack.contents");
const popupConfig = require("../config/webpack.popup");

process.env.NODE_ENV = "development";

function startPopup() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(popupConfig);
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500,
    });

    //compiler.hooks.compilation.tap("compilation", (compilation) => {
    //  compilation.hooks.htmlWebpackPluginAfterEmit.tapAsync(
    //    "html-webpack-plugin-after-emit",
    //    (data, cb) => {
    //      hotMiddleware.publish({ action: "reload" });
    //      cb();
    //    }
    //  );
    //});

    //const server = new webpackDevServer(compiler, {
    //  contentBase: path.join(__dirname, ".."),
    //  quiet: true,
    //  before(app, ctx) {
    //    app.use(hotMiddleware);
    //    ctx.middleware.waitUntilValid(() => {
    //      resolve();
    //    });
    //  },
    //});

    //server.listen(9080);
  });
}

function startBackground() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(backgroundConfig);
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500,
    });

    compiler.hooks.watchRun.tapAsync("watch-run", (compilation, done) => {
      hotMiddleware.publish({ action: "compiling" });
      done();
    });

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err);
        return;
      }

      resolve();
    });
  });
}

function startContents() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(contentsConfig);
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500,
    });

    compiler.hooks.watchRun.tapAsync("watch-run", (compilation, done) => {
      hotMiddleware.publish({ action: "compiling" });
      done();
    });

    compiler.watch({}, (err, stats) => {
      if (err) {
        console.log(err);
        return;
      }

      resolve();
    });
  });
}

function init() {
  Promise.all([startBackground(), startContents(), startPopup()]).then(
    () => {}
  );
}

init();
