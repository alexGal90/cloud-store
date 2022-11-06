import File from '../models/File.js';
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
}

export default new FileController();
