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

const updateLocation = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID is required.'});
    try {
        await api.get(`/location/${req.body.id}`);

        const payload = {};

        if (req.body.code) payload.code = req.body.code;
        if (req.body.name) payload.name = req.body.name;
        if (req.body.street) payload.street = req.body.street;
        if (req.body.city) payload.city = req.body.city
        if (req.body.state) payload.state = req.body.state
        if (req.body.postcode) payload.postcode = req.body.postcode
        if (req.body.country_code) payload.country_code = req.body.country_code
        if (req.body.remarks) payload.remarks = req.body.remarks
        
        const result = await api.put(`/location/${req.body.id}`, payload);
        res.json(result.data);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No location matches ID ${req.body.id}` });
        }
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update location" });
    }
}

const updateLocationArchive = async (req, res) => {
    const {id, is_archived} = req.body
    if (!id || !is_archived) return res.status(400).json({ "message": "ID and archive are required"})
    if (typeof is_archived !== "boolean") return res.status(400).json({ "message" : "is_archived must be boolean"})
    try {
        await api.get(`/location/${id}`)
        const payload = {is_archived}
        const result = await api.patch(`/location/${id}`, payload)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No location matches ID ${id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update location archive" });
    }
}

module.exports = {
    getLocationList,
    getLocation,
    createLocation,
    updateLocation,
    updateLocationArchive
}