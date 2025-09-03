const api = "https://api.bukku.fyi/files";
const axios = require("axios");
const dotenv = require('dotenv');
const FormData = require("form-data");
const fs = require("fs");
dotenv.config();

const PAGE_SIZE = 20;
const allowedTypes = ["IMAGE", "VIDEO", "EXCEL", "PDF"];

const uploadFile = async(req, res) => {
    // req.file comes from multer middleware
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // Prepare multipart form data
    const form = new FormData();
    form.append("file", fs.createReadStream(req.file.path), req.file.originalname);
    
    try {
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

const readFileLists = async (req, res) => {
    const { search, type, page } = req.query;
    
    // Build query params
    const params = {
      page: page ? parseInt(page, 10) : 1,
      page_size: PAGE_SIZE,
    };

    if (search) params.search = search;
    if (type && allowedTypes.includes(type)) params.type = type;
  try {
    // Call Bukku API
    const response = await axios.get(api, {
      params,
      headers: {
        Authorization: `Bearer ${process.env.BUKKU_ACCESS_TOKEN}`,
      },
    });

    res.json(response.data);
  } catch (err) {
    console.error(
      "Failed to fetch file list:",
      err.response?.data || err.message || err
    );
    res.status(500).json({
      message: "Failed to fetch file list",
      error: err.response?.data || err.message,
    });
  }
};

const readFile = async(req, res) => {
    const { id } = req.params;
    if (!id){
        return res.status(400).json({message: 'id is required'});
    }
    try{
        const response = await axios.get(`${api}/${id}`,{
            headers: {
                Authorization: `Bearer ${process.env.BUKKU_ACCESS_TOKEN}`
            },
        })
    }catch(err){
        console.error("Failed to fetch file:", err.response?.data || err.message);
    res.status(500).json({message: "Failed to fetch file", error: err.response?.data || err.message,});
    }
}

module.exports = {
    uploadFile,
    readFileLists,
    readFile,
}