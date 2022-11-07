import * as fs from 'fs';

import File from '../models/File.js';
import User from '../models/User.js';
import fileService from '../services/fileService.js';

class FileController {
  async createDirectory(req, res) {
    try {
      const { name, extension, parentFoldery } = req.body;
      const file = new File({ name, extension, parentFoldery, user: req.user.id });
      const parentFile = await File.findOne({ _id: parentFoldery });
      if (parentFile) {
        file.path = `${parentFile.path}/${file.name}`;
        await fileService.createDirectory(file);
        parentFile.children.push(file._id);
        await parentFile.save();
      } else {
        file.path = name;
        await fileService.createDirectory(file);
      }
      await file.save();
      return res.json(file);
    } catch (error) {
      console.warn(error);
      return res.status(400).json(error);
    }
  }

  async getFiles(req, res) {
    try {
      const files = await File.find({ user: req.user.id, parentFoldery: req.query.parentFoldery });
      return res.json(files);
    } catch (error) {
      console.warn(error);
      return res.status(500).json({ message: "Can't find files" });
    }
  }

  async uploadFile(req, res) {
    try {
      const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
      let response = [];

      for (const file of files) {
        const parentFoldery = await File.findOne({
          user: req.user.id,
          _id: req.body.parentFoldery,
        });
        const user = await User.findOne({ _id: req.user.id });

        if (user.emptySpace - file.size < 0) {
          return res.status(400).json({ message: 'Not enough space on your disk' });
        }

        user.emptySpace -= file.size;

        const filePath = `${process.env.FILE_PATH}/${user._id}${
          parentFoldery ? `/${parentFoldery.path}` : ''
        }/${file.name}`;

        if (fs.existsSync(filePath)) {
          return res.status(400).json({ message: 'File is already existed' });
        }

        file.mv(filePath);

        const extension = file.name.split('.').pop();
        const fullFilePath = parentFoldery ? `${parentFoldery.path}/${file.name}` : file.name;
        const fileDB = new File({
          name: file.name,
          extension,
          size: file.size,
          path: fullFilePath,
          user: user._id,
          parentFoldery: parentFoldery?._id,
        });

        await fileDB.save();
        await user.save();
        response.push(fileDB);
      }

      res.json(response);
    } catch (error) {
      console.warn(error);
      return res.status(500).json({ message: 'File uploading error' });
    }
  }

  async downloadFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      const filePath = `${process.env.FILE_PATH}/${req.user.id}/${file.path}`;

      if (fs.existsSync(filePath)) {
        return res.download(filePath, file.name);
      }

      return res.status(400).json({ message: 'File downloading error' });
    } catch (error) {
      console.warn(error);
      return res.status(500).json({ message: 'File downloading error' });
    }
  }

  async removeFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      if (!file) {
        return res.status(400).json({ message: 'File not found' });
      }
      fileService.removeFile(file);
      await file.remove();
      return res.json({ message: 'file was removed' });
    } catch (error) {
      console.warn(error);
      res.status(500).json({ message: 'File removing error' });
    }
  }
}

export default new FileController();
