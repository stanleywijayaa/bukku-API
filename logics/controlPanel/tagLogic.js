const axios = require('axios')
const accessToken = process.env.BUKKU_ACCESS_TOKEN
const subdomain = process.env.SUBDOMAIN
const url = process.env.BUKKU_API_URL

const api = axios.create({
  baseURL: `${url}`,
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Company-Subdomain": subdomain,
    "Accept": "application/json"
  }
});

const getTagList = async(req, res) => {
    try {
        const {include_archived} = req.query;
        const tagInfo = await api.get('/tags', { include_archived });
        res.json(tagInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch tags" });
    }
}

const getTag = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/tags/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch tags" });
    }
}

module.exports = {
    getTagList,
    getTag
}