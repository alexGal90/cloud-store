import * as fs from 'fs';

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
      fs.rmdirSync(filePath);
    } else {
      fs.unlinkSync(filePath);
    }
  }

  getPath(file) {
    return `${process.env.FILE_PATH}/${file.user}/${file.path}`;
  }
}

export default new FileService();
