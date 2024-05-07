import fs from "fs";
import {createHash} from "crypto";
import {load} from "cheerio";
import path from "path";

/**
 * Find and extract all inline scripts injected into index file by the SvelteKit builder. This needs to be done due to
 * ManifestV3 restrictions on inline/loaded scripts usage. The only way to run scripts in popup is by specifying
 * `<script>` tag with the path. Thanks, ManifestV3!
 *
 * @param {string} indexFilePath Path to the index.html file. This file will be overridden and all the inline scripts
 * found inside it will be placed in the same directory.
 */
export function extractInlineScriptsFromIndex(indexFilePath) {
  const directory = path.dirname(indexFilePath);
  const html = fs.readFileSync(indexFilePath, 'utf8');
  const ch = load(html);

  ch('script').each((index, scriptElement) => {
    const $script = ch(scriptElement);
    const scriptContent = $script.text();

    const contentsHash = createHash('sha256')
      .update(scriptContent)
      .digest('base64url')
      .substring(0, 8);

    const fileName = `init.${contentsHash}.js`;
    const filePath = path.resolve(directory, fileName);
    const publicPath = `./${fileName}`;

    fs.writeFileSync(
      filePath,
      // This will work for minifying index script of the SvelteKit, but might cause some issues if any other scripts
      // will appear. Good for now.
      scriptContent
        .replaceAll("\t", "")
        .replaceAll("\n", "")
    );

    $script.attr('src', publicPath);
    $script.text('');
  });

  fs.writeFileSync(indexFilePath, ch.html());
}
