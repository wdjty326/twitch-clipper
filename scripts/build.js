process.env.NODE_ENV = "production";

const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");

const execWebpack = async (name) => {
  const stdout = execSync(`webpack --config config/webpack.${name}.js`, {
    cwd: path.resolve(__dirname, ".."),
  });
  console.log(stdout.toString("utf-8"));
};

const buildWebpack = async () => {
  try {
    if (fs.existsSync(path.resolve(__dirname, "..", "dist"))) {
      if (os.platform() === "win32") {
        execSync(`rd /q /s ${path.resolve(__dirname, "..", "dist")}`);
      } else {
        execSync(`rm -rf ${path.resolve(__dirname, "..", "dist", "*")}`);
      }
    }

    await execWebpack("popup");
    await execWebpack("background");
    await execWebpack("contents");
  } catch (e) {
    if (Array.isArray(e.output)) {
      e.output.forEach((buffer) => {
        if (buffer !== null) console.error(buffer.toString("utf-8"));
      });
    }
  }
};

buildWebpack();
