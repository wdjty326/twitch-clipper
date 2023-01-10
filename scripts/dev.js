process.env.NODE_ENV = "development";

const path = require("path");
const fs = require("fs");

const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const webpackHotMiddleware = require("webpack-hot-middleware");
const { merge } = require("webpack-merge");

const backgroundConfig = require("../config/webpack.background");
const contentsConfig = require("../config/webpack.contents");
const popupConfig = require("../config/webpack.popup");

const popupIndex = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>
    <iframe src="http://localhost:9080" width="340" height="580" style="border:none"></iframe>
  </body>
</html>`;

const manifestString = JSON.stringify({
  manifest_version: 3,
  name: "Chrome Extensions Template Test",
  description: "Base Level Extension Template Test",
  version: "1.0",
  permissions: ["bookmarks", "contextMenus"],
  action: {
    default_popup: "index.html",
  },
  content_scripts: [
    {
      matches: ["https://twitch.tv/*"],
      js: ["contents.js"],
    },
  ],
  background: {
    service_worker: "background.js",
  },
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
});

function startPopup() {
  if (!fs.existsSync(path.resolve(__dirname, "..", "dist")))
    fs.mkdirSync(path.resolve(__dirname, "..", "dist"));

  fs.writeFileSync(
    path.resolve(__dirname, "..", "dist", "index.html"),
    popupIndex,
    {
      encoding: "utf-8",
    }
  );

  fs.writeFileSync(
    path.resolve(__dirname, "..", "dist", "manifest.json"),
    manifestString,
    {
      encoding: "utf-8",
    }
  );

  return new Promise((resolve, reject) => {
    const compiler = webpack(popupConfig);
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500,
    });

    const server = new webpackDevServer(compiler, {
      static: {
        directory: path.join(__dirname, ".."),
      },
      onBeforeSetupMiddleware({ app, middleware }) {
        app.use(hotMiddleware);
        middleware.waitUntilValid(() => {
          resolve();
        });
      },
    });

    server.listen(9080);
  });
}

function startBackground() {
  const watchRun = new Promise((resolve) => {
    const ansiColors = {
      red: "00FF00",
    };
    const overlayStyles = {
      color: "#FF0000",
    };

    const compiler = webpack(
      merge(backgroundConfig, {
        entry: {
          background: [
            //"webpack-hot-middleware/client?path=/__background&timeout=20000&reload=true&ansiColors=" +
            //  encodeURIComponent(JSON.stringify(ansiColors)) +
            //  "&overlayStyles=" +
            //  encodeURIComponent(JSON.stringify(overlayStyles)),
            path.resolve(__dirname, "..", "src", "background", "index.ts"),
          ],
        },
        devtool: "source-map",
        plugins: [new webpack.HotModuleReplacementPlugin()],
      })
    );
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      path: "/__background",
      heartbeat: 2500,
    });

    compiler.hooks.watchRun.tapAsync("watch-run", (_, done) => {
      hotMiddleware.publish({ action: "compiling" });
      done();
    });

    compiler.watch({}, (err) => {
      if (err) {
        console.log(err);
        return;
      }
      resolve();
    });
  });

  const webSocketServer = new Promise((resolve) => {
    const compiler = webpack(backgroundConfig);
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500,
    });

    const server = new webpackDevServer(compiler, {
      static: {
        directory: path.join(__dirname, ".."),
      },
      webSocketServer: "ws",
      onBeforeSetupMiddleware({ app, middleware }) {
        app.use(hotMiddleware);
        middleware.waitUntilValid(() => {
          resolve();
        });
      },
    });

    server.listen(9081);
  });

  return Promise.all([watchRun, webSocketServer]);
}

function startContents() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(contentsConfig);
    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      path: "/__contents",
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
