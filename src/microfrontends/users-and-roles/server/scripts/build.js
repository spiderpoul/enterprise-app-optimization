const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const distDir = path.resolve(projectRoot, '..', 'dist');
const filesToCopy = ['server.js'];

const ensureDist = () => {
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true });
  }

  fs.mkdirSync(distDir, { recursive: true });
};

const copy = (source, destination) => {
  fs.copyFileSync(source, destination);
};

const build = () => {
  ensureDist();

  for (const file of filesToCopy) {
    const source = path.resolve(projectRoot, '..', file);
    const destination = path.join(distDir, file);
    if (fs.existsSync(source)) {
      copy(source, destination);
    }
  }

  console.log(`Users and roles server artifacts copied to ${distDir}`);
};

build();
