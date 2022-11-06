import * as fs from 'fs';

class FileService {
  createDirectory(file) {
    const filePath = `${process.env.FILE_PATH}/${file.user}/${file.path}`;
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
}

export default new FileService();
