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
    await fsp.access(sourcePath);

    // delete the destination folder to make an identical copy
    await fsp.rm(destinationPath, { force: true, recursive: true });
    await fsp.mkdir(destinationPath, { recursive: true });

    const objectsInFolder = await fsp.readdir(sourcePath, { withFileTypes: true });
    for (const object of objectsInFolder) {
      const srcPath = path.join(sourcePath, object.name);
      const dstPath = path.join(destinationPath, object.name);

      if (object.isDirectory()) {
        await syncDirectory(srcPath, dstPath);
      } else if (object.isFile()) {
        await fsp.copyFile(srcPath, dstPath);
      }
    }
  } catch (err) {
    throw new Error(err);
  }
}

async function replaceAsync(str, regex, asyncFn) {
  const promises = [];
  str.replace(regex, (match, ...args) => {
    const promise = asyncFn(match, ...args);
    promises.push(promise);
  });
  const data = await Promise.all(promises);
  return str.replace(regex, () => data.shift());
}

async function replaceTemplate(componentsDirPath, templateFilePath, resultFilePath) {
  try {
    const templateContent = await fsp.readFile(templateFilePath, 'utf-8');

    const templatePattern = RegExp('{{\\w+}}', 'g');
    const newStr = await replaceAsync(templateContent, templatePattern, async finded => {
      const fileName = finded.slice(2, -2);
      const filePath = path.join(componentsDirPath, `${fileName}.html`);
      const fileContent = await fsp.readFile(filePath, 'utf-8');
      return fileContent;
    });

    fsp.writeFile(resultFilePath, newStr, 'utf-8');
  } catch (err) {
    throw new Error(err);
  }
}

async function bundleTheProject(intoDir) {
  const projecDirPath = path.join(__dirname, intoDir);
  const stylesFromPath = path.join(__dirname, 'styles');
  const CSSBundleFilePath = path.join(projecDirPath, 'style.css');
  const sourceAssetsPath = path.join(__dirname, 'assets');
  const destAssetsPath = path.join(projecDirPath, 'assets');
  const componentsPath = path.join(__dirname, 'components');
  const templateFilePath = path.join(__dirname, 'template.html');
  const indexFilePath = path.join(projecDirPath, 'index.html');

  try {
    await fsp.mkdir(projecDirPath, { recursive: true });
    replaceTemplate(componentsPath, templateFilePath, indexFilePath);
    mergeStyles(stylesFromPath, CSSBundleFilePath);
    syncDirectory(sourceAssetsPath, destAssetsPath);
  } catch (err) {
    throw new Error(err);
  }
}

bundleTheProject('project-dist');
