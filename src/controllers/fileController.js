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

      // If this foldery has parent folder save it inside this foldery
      if (parentFile) {
        file.path = `${parentFile.path}/${file.name}`;
        await fileService.createDirectory(file);
        parentFile.children.push(file._id);
        await parentFile.save();
      } else {
        // If there is no parent foldery save it in root level
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
      // Get the list of files in current directory
      const files = await File.find({ user: req.user.id, parentFoldery: req.query.parentFoldery });
      return res.json(files);
    } catch (error) {
      console.warn(error);
      return res.status(500).json({ message: 'Files are not found' });
    }
  }

  async uploadFile(req, res) {
    try {
      // Check single or multiple files are uploaded
      const files = Array.isArray(req.files.file) ? req.files.file : [req.files.file];
      let response = [];

      for (const file of files) {
        const parentFoldery = await File.findOne({
          user: req.user.id,
          _id: req.body.parentFoldery,
        });

        const user = await User.findOne({ _id: req.user.id });

        if (user.emptySpace - file.size < 0) {
          return res.status(400).json({ message: 'There is no enough space' });
        }

        // Update user empty space
        user.emptySpace -= file.size;

        // If parent foldery exists save inside it
        // else save in root folsery
        const filePath = `${process.env.FILE_PATH}/${user._id}${
          parentFoldery ? `/${parentFoldery.path}` : ''
        }/${file.name}`;

        if (fs.existsSync(filePath)) {
          return res.status(400).json({ message: 'File is already existed' });
        }

        // Save the file on the server
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

        // Add the file as a child for parent foldery
        if (parentFoldery) {
          parentFoldery.children.push(fileDB._id);
          await parentFoldery.save();
        }
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

      return res.status(400).json({ message: 'File is not found' });
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
      // Remove the file from server
      fileService.removeFile(file);

      // Remove file from DB
      const removeFilesRecursive = async (fileChildren, userId) => {
        for (const fileId of fileChildren) {
          const fileDB = await File.findOne({ _id: fileId, user: userId });
          if (fileDB.children.length) {
            removeFilesRecursive(fileDB.children, userId);
          }
          await fileDB.remove();
        }
      };

      removeFilesRecursive(file.children, req.user.id);
      await file.remove();
      return res.json({ message: 'File was removed' });
    } catch (error) {
      console.warn(error);
      res.status(500).json({ message: 'File removing error' });
    }
  }

  async renameFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.body.id, user: req.user.id });
      fileService.renameFile(file, req.body.name);
      file.path = `${file.path.slice(0, file.path.length - file.name.length)}${req.body.name}`;
      file.name = req.body.name;
      await file.save();

      const updateChildrenFilePathRecursive = async (file, userId) => {
        for (const childId of file.children) {
          const childFileDB = await File.findOne({ _id: childId, user: userId });
          if (childFileDB.children.length) {
            updateChildrenFilePathRecursive(childFileDB, userId);
          }
          childFileDB.path = `${file.path}/${childFileDB.name}`;
          await childFileDB.save();
        }
      };

      updateChildrenFilePathRecursive(file, req.user.id);

      return res.json({ message: 'File was renamed' });
    } catch (error) {
      console.warn(error);
      res.status(500).json({ message: 'File renaming error' });
    }
  }
}

export default new FileController();
