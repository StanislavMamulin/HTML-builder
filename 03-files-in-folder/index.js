const fs = require('fs/promises');
const path = require('path');

async function getStatOfFilesInFolder(folderPath) {
  try {
    const objectsInFolder = await fs.readdir(folderPath, { withFileTypes: true });

    for (const foldersObject of objectsInFolder) {
      if (foldersObject.isFile()) {
        const fileInfos = [];
        
        const fileName = foldersObject.name;
        const filePath = path.join(folderPath, fileName);
        const extension = path.extname(fileName);
        const size = (await fs.stat(filePath)).size;

        fileInfos.push(path.basename(filePath, extension)); // filename without extension
        fileInfos.push(extension.slice(1)); // remove '.' from extension
        fileInfos.push(size + ' Bytes');

        console.log(fileInfos.join(' - '));
      }
    }
  } catch (err) {
    throw new Error(err);
  }
}

const folderPath = path.join(__dirname, 'secret-folder');
getStatOfFilesInFolder(folderPath);
