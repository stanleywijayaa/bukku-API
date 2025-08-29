const api = "https://api.bukku.fyi/v2/lists";
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const getLists = async (req, res) => {
  const { lists } = req.body;
  if (!lists) {
    return res.status(400).json({ message: "Lists is required" });
  }
  const bukkuPayload = {
    filter: { type: lists },
  };

  try {
    const response = await axios.post(api, bukkuPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BUKKU_ACCESS_TOKEN}`,
      },
    });
    res.json(response.data);
  } catch (err) {
    console.error(
      "failed to fetch lists",
      err.response?.data || err.message || err
    );
  }
};

module.exports = {
    getLists,
}
