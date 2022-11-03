const fs = require('fs');
const path = require('path');
const readline = require('readline');

function writeToFileFromConsole(filePath) {
  const output = fs.createWriteStream(filePath);
  const greeting = 'Enter text to write to the file.\
  \nTo finish writing, please type "exit" or press "ctrl + c"';
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  console.log(greeting);
  rl.on('line', line => {
    if (line.toLowerCase() === 'exit') {
      rl.close();
      return;
    }
    
    output.write(line += '\n');
  });
  
  rl.on('close', () => {
    console.log('That\'s all Folks!!!');
  });
  
}

const pathOfFileToWrite = path.join(__dirname, 'text.txt');
writeToFileFromConsole(pathOfFileToWrite);
