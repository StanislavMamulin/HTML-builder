const fs = require('fs/promises');
const path = require('path');

async function syncDirectory(sourcePath, destinationPath) {
  if (!sourcePath
    || !destinationPath
    || typeof sourcePath !== 'string'
    || typeof destinationPath !== 'string'
  ) {
    console.log('You need to specify the source and destination folder!');
    return;
  }

  try {
    // check the source path, if it doesn't exist throw an error
    await fs.access(sourcePath);

    // delete the destination folder to make an identical copy
    await fs.rm(destinationPath, { force: true, recursive: true });
    await fs.mkdir(destinationPath, { recursive: true });

    const objectsInFolder = await fs.readdir(sourcePath, { withFileTypes: true });
    for (const object of objectsInFolder) {
      const srcPath = path.join(sourcePath, object.name);
      const dstPath = path.join(destinationPath, object.name);

      if (object.isDirectory()) {
        await syncDirectory(srcPath, dstPath);
      } else if (object.isFile()) {
        await fs.copyFile(srcPath, dstPath);
      }
    }
  } catch (err) {
    throw new Error(err);
  }
}

const source = path.join(__dirname, 'files');
const destination = path.join(__dirname, 'files-copy');

syncDirectory(source, destination);
