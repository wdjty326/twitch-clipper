process.env.NODE_ENV = "development";

const path = require("path");
const fs = require("fs");
const { WebSocketServer, WebSocket } = require("ws");

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
  permissions: ["activeTab", "background", "tabs"],
  action: {
    default_popup: "index.html",
  },
    content_scripts: [
      {
        matches: ["https://www.twitch.tv/*", "https://twitch.tv/*"],
        js: ["contents.js"],
      },
    ],
  host_permissions: ["https://www.twitch.tv/*", "https://twitch.tv/*"],
  background: {
    service_worker: "background.js",
  },
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'",
  },
});

const wss = new WebSocketServer({
  port: 9081,
  path: "/ws",
});

wss.on("connection", (ws) => {
  ws.on("message", (data, isBinary) => {
    wss.clients.forEach((client) => {
      if (client === ws && client.readyState === WebSocket.OPEN) {
        if (!isBinary && data.toString() === "#PING") {
          client.send("#PONG", { binary: false });
        }
      }
    });
  });
});

const ansiColors = {
  red: "00FF00",
};
const overlayStyles = {
  color: "#FF0000",
};

function initPopup() {
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

function initBackground() {
  return new Promise((resolve) => {
    const compiler = webpack(
      merge(backgroundConfig, {
        entry: {
          background: [
            "webpack-hot-middleware/client?path=/__background&timeout=20000&reload=true&ansiColors=" +
              encodeURIComponent(JSON.stringify(ansiColors)) +
              "&overlayStyles=" +
              encodeURIComponent(JSON.stringify(overlayStyles)),
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

    compiler.watch(
      {
        ignored: ["**/node_modules/**", "src/contents/**/*", "src/popup/**/*"],
        aggregateTimeout: 1000,
      },
      (err, state) => {
        if (err) {
          console.log(err);
          return;
        }

        Object.keys(state.compilation.assets).map((fileName) => {
          if (
            fileName.lastIndexOf(".map") !== -1 ||
            fileName.includes("hot-update")
          ) {
            const filePath = path.resolve(__dirname, "..", "dist", fileName);
            if (fs.existsSync(filePath)) {
              fs.rmSync(filePath, { force: true });
            }
          }
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send("#BACKGROUND", {
              binary: false,
            });
          }
        });

        resolve();
      }
    );
  });
}

function initContents() {
  return new Promise((resolve, reject) => {
    const compiler = webpack(
      merge(contentsConfig, {
        entry: {
          background: [
            "webpack-hot-middleware/client?path=/__contents&timeout=20000&reload=true&ansiColors=" +
              encodeURIComponent(JSON.stringify(ansiColors)) +
              "&overlayStyles=" +
              encodeURIComponent(JSON.stringify(overlayStyles)),
            path.resolve(__dirname, "..", "src", "background", "index.ts"),
          ],
        },
        devtool: "source-map",
        plugins: [new webpack.HotModuleReplacementPlugin()],
      })
    );

    const hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      path: "/__contents",
      heartbeat: 2500,
    });

    compiler.hooks.watchRun.tapAsync("watch-run", (_, done) => {
      hotMiddleware.publish({ action: "compiling" });
      done();
    });

    compiler.watch(
      {
        ignored: [
          "**/node_modules/**",
          "src/background/**/*",
          "src/popup/**/*",
        ],
        aggregateTimeout: 1000,
      },
      (err, state) => {
        if (err) {
          console.log(err);
          return;
        }

        Object.keys(state.compilation.assets).map((fileName) => {
          if (
            fileName.lastIndexOf(".map") !== -1 ||
            fileName.includes("hot-update")
          ) {
            const filePath = path.resolve(__dirname, "..", "dist", fileName);
            if (fs.existsSync(filePath)) {
              fs.rmSync(filePath, { force: true });
            }
          }
        });

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send("#CONTENT-SCRIPTS", {
              binary: false,
            });
          }
        });

        resolve();
      }
    );
  });
}

async function init() {
  await initBackground();
  await initContents();
  await initPopup();
}

init();
