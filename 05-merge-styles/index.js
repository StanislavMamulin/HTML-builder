const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

async function mergeStyles(fromDirPath, toFilePath) {
  const readPromises = [];
  
  try {
    await fsp.rm(toFilePath, { force: true });

    const writeStream = fs.createWriteStream(toFilePath, { flags: 'a' });
    const objectsInDir = await fsp.readdir(fromDirPath, { withFileTypes: true });

    for (const object of objectsInDir) {
      if (object.isFile()) {
        const filePath = path.join(fromDirPath, object.name);
        const extension = path.extname(filePath);
        if (extension === '.css') {
          readPromises.push(fsp.readFile(filePath, 'utf-8'));
        }
      }
    }

    const files = await Promise.all(readPromises);
    for (const file of files) {
      writeStream.write(file);
    }
  } catch (err) {
    throw new Error(err);
  }
}

const stylesFromPath = path.join(__dirname, 'styles');
const toFilePath = path.join(__dirname, 'project-dist', 'bundle.css');

mergeStyles(stylesFromPath, toFilePath);
