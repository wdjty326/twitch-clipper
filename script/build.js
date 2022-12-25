const path = require("path");
const fs = require("fs");
const os = require("os");
const { execSync } = require("child_process");

const execWebpack = async (name) => {
  try {
    const stdout = execSync(`webpack --config config/webpack.${name}.js`, {
      cwd: path.resolve(__dirname, ".."),
    });
    console.log(stdout.toString("utf-8"));
  } catch (e) {
    console.error(e);
  }
};

const buildWebpack = async () => {
  if (fs.existsSync(path.resolve(__dirname, "..", "dist"))) {
    try {
      if (os.platform() === "win32") {
        execSync(`rd /q /s ${path.resolve(__dirname, "..", "dist")}`);
      } else {
        execSync(`rm -rf ${path.resolve(__dirname, "..", "dist", "*")}`);
      }
    } catch (e) {
      console.error(e);
      return;
    }
  }

  await execWebpack("popup");
  await execWebpack("background");
  await execWebpack("contents");
};

buildWebpack();