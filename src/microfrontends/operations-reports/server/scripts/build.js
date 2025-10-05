const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const distDir = path.resolve(projectRoot, '..', 'dist');
const filesToCopy = ['server.js'];
const directoriesToCopy = ['data', 'swagger'];

const ensureDist = () => {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  fs.mkdirSync(distDir, { recursive: true });
};

const copyFile = (source, destination) => {
  fs.copyFileSync(source, destination);
};

const copyDirectory = (source, destination) => {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination, { recursive: true });
  }

  for (const entry of fs.readdirSync(source)) {
    const sourceEntry = path.join(source, entry);
    const destinationEntry = path.join(destination, entry);
    const stats = fs.statSync(sourceEntry);

    if (stats.isDirectory()) {
      copyDirectory(sourceEntry, destinationEntry);
    } else {
      fs.copyFileSync(sourceEntry, destinationEntry);
    }
  }
};

const build = () => {
  ensureDist();

  for (const file of filesToCopy) {
    const source = path.resolve(projectRoot, '..', file);
    const destination = path.join(distDir, file);
    if (fs.existsSync(source)) {
      copyFile(source, destination);
    }
  }

  for (const directory of directoriesToCopy) {
    const source = path.resolve(projectRoot, '..', directory);
    if (fs.existsSync(source)) {
      copyDirectory(source, path.join(distDir, directory));
    }
  }

  console.log(`Operations reports server artifacts copied to ${distDir}`);
};

build();
