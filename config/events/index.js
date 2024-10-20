import fs from "fs";
import path from "path";
import { minify } from "terser";

const errorPages = [
  "404",
  "500",
  "1000",
  "broken",
  "error",
  "js-challenge",
  "not-allowed",
  "rate-limit",
];

export const copyErrorPages = () => {
  errorPages.forEach((errorPage) => {
    const sourcePath = path.join("_site", errorPage, "index.html");
    const destinationPath = path.join("_site", `${errorPage}.html`);
    const directoryPath = path.join("_site", errorPage);

    fs.copyFile(sourcePath, destinationPath, (err) => {
      if (err) {
        console.error(`Error copying ${errorPage} page:`, err);
        return;
      }

      fs.unlink(sourcePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error(
            `Error deleting source file for ${errorPage} page:`,
            unlinkErr
          );
          return;
        }

        fs.rmdir(directoryPath, (rmdirErr) => {
          if (rmdirErr)
            console.error(
              `Error removing directory for ${errorPage} page:`,
              rmdirErr
            );
        });
      });
    });
  });
};

export const minifyJsComponents = async () => {
  const scriptsDir = "_site/assets/scripts";

  const minifyJsFilesInDir = async (dir) => {
    const files = fs.readdirSync(dir);
    for (const fileName of files) {
      const filePath = path.join(dir, fileName);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await minifyJsFilesInDir(filePath);
      } else if (fileName.endsWith(".js")) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const minified = await minify(fileContent);
        if (minified.error) {
          console.error(`Error minifying ${filePath}:`, minified.error);
        } else {
          fs.writeFileSync(filePath, minified.code);
        }
      } else {
        console.log(`No .js files to minify in ${filePath}`);
      }
    }
  };

  await minifyJsFilesInDir(scriptsDir);
};
