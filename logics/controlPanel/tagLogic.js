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

const createTag = async(req, res) => {
    const {
        name,
        tag_group_id
    } = req.body

    if ( !name || !tag_group_id ) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    try {
        const payload = {
            name,
            tag_group_id
        };
        const response = await api.post('/tags', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create tags" });
    }
}

const updateTag = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID is required.'});
    try {
        await api.get(`/tags/${req.body.id}`);

        const payload = {};
        if (typeof req.body.tag_group_id === "number") payload.tag_group_id = req.body.tag_group_id;
        if (req.body.name) payload.name = req.body.name;
        
        const result = await api.put(`/tags/${req.body.id}`, payload);
        res.json(result.data);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No tag matches ID ${req.body.id}` });
        }
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update tag" });
    }
}

const deleteTag = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({"message": "Delete ID required"})
    try {
        await api.get(`/tags/${req.body.id}`)
        const result = await api.delete(`/tags/${req.body.id}`)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No tag matches ID ${req.body.id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to delete tag" });
    }
}

module.exports = {
    getTagList,
    getTag,
    createTag,
    updateTag,
    deleteTag
}