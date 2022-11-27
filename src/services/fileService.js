import * as fs from 'fs';

// This service works with the server file system
class FileService {
  createDirectory(file) {
    const filePath = this.getPath(file);
    return new Promise((resolve, reject) => {
      try {
        if (fs.existsSync(filePath)) {
          return reject({ message: `File with path ${filePath} alreary exists` });
        } else {
          fs.mkdirSync(filePath);
          return resolve({ message: `File ${file.name} was created` });
        }
      } catch (error) {
        return reject({ message: 'File error' });
      }
    });
  }

  removeFile(file) {
    const filePath = this.getPath(file);
    if (file.extension === 'dir') {
      fs.rmSync(filePath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(filePath);
    }
  }

  renameFile(file, newName) {
    const filePath = this.getPath(file);
    const newFilePath = `${filePath.slice(0, filePath.length - file.name.length)}${newName}`;
    fs.renameSync(filePath, newFilePath);
  }

  // Helper method to get full file path
  getPath(file) {
    return `${process.env.FILE_PATH}/${file.user}/${file.path}`;
  }
}

export default new FileService();
