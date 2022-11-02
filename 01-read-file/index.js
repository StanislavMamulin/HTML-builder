const fs = require('fs');
const path = require('path');

function outputFileToConsole(filePath) {
    let text = '';
    const readableStream = fs.createReadStream(filePath, 'utf-8');

    readableStream.on('data', chunk => text += chunk);
    readableStream.on('error', error => console.error('Error', error.message));
    readableStream.on('end', () => console.log(text));
}

const textFilePath = path.join(__dirname ,'text.txt')
outputFileToConsole(textFilePath);
