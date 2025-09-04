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

const getLocationList = async(req, res) => {
    try {
        const {include_archived} = req.query;
        const locationInfo = await api.get('/locations', { include_archived });
        res.json(locationInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch location" });
    }
}

module.exports = {
    getLocationList
}