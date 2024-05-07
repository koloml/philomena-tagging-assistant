import {packExtension} from "./.vite/pack-extension.js";
import path from "path";
import {fileURLToPath} from "url";

const __dirname = fileURLToPath(new URL('.', import.meta.url));

void packExtension({
  rootDir: __dirname,
  exportDir: path.resolve(__dirname, 'build'),
  contentScriptsDir: path.resolve(__dirname, 'build', 'content')
});
