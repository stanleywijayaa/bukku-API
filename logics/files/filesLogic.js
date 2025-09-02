const api = "https://api.bukku.fyi/files";
const axios = require("axios");
const dotenv = require('dotenv');
const FormData = require("form-data");
const fs = require("fs");
dotenv.config();

const uploadFile = async(req, res) => {
    try {
    // req.file comes from multer middleware
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Prepare multipart form data
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path), req.file.originalname);

    // Send to Bukku
    const response = await axios.post(api, form, {
      headers: {
        ...form.getHeaders(), // important to set boundary for multipart/form-data
        Authorization: `Bearer ${process.env.BUKKU_ACCESS_TOKEN}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error("File upload failed:", err.response?.data || err.message || err);
    res.status(500).json({
      message: "Failed to upload file",
      error: err.response?.data || err.message,
    });
  }
}

module.exports = {
    uploadFile,
}