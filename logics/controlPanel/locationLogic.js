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
        const locationInfo = await api.get('/location', { include_archived });
        res.json(locationInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch location" });
    }
}

const getLocation = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/location/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch location" });
    }
}

const createLocation = async(req, res) => {
    const {
        code,
        name,
        street,
        city,
        state,
        postcode,
        country_code,
        remarks
    } = req.body

    if ( !name || !code ) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const payload = {
            name,
            code
        };

        if (street) payload.street = street;
        if (city) payload.city = city;
        if (state) payload.state = state;
        if (postcode) payload.postcode = postcode;
        if (country_code) payload.country_code = country_code;
        if (remarks) payload.remarks = remarks;
    
        const response = await api.post('/location', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create location" });
    }
}

module.exports = {
    getLocationList,
    getLocation,
    createLocation
}