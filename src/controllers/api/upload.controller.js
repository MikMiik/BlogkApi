const path = require("path");
const fs = require("fs").promises;
const baseURL = process.env.BASE_URL;
exports.upload = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).send("No file uploaded");

  const ext = path.extname(file.originalname);
  const filename = Date.now() + "-" + file.fieldname + ext;
  const uploadDir = path.join(__dirname, "..", "..", "..", "public", "uploads");
  const newPath = path.join(uploadDir, filename);

  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.rename(file.path, newPath);
    res.success(200, { url: `${baseURL}/uploads/${filename}` });
  } catch (err) {
    res.status(500).send("File rename failed");
  }
};
