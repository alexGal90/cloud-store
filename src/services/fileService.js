import * as fs from 'fs';
import fse from 'fs-extra/esm';

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

  copyFile(file, fileCopyParentFoldery) {
    const filePath = this.getPath(file);
    const fileCopyParentFolderyPath = fileCopyParentFoldery
      ? `${this.getPath(fileCopyParentFoldery)}/${file.name}`
      : `${process.env.FILE_PATH}/${file.user}/${file.name}`;
    fse.copySync(filePath, fileCopyParentFolderyPath, { overwrite: false });
  }

  // Helper method to get full file path
  getPath(file) {
    return `${process.env.FILE_PATH}/${file.user}/${file.path}`;
  }
}

export default new FileService();
