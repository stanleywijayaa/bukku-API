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

const getAccountList = async(req, res) => {
    try {
        const {
            search,
            type,
            is_archived,
            sort_by,
            sort_dir,
        } = req.query;

        const allowedSearch = ["No.", "Reference No.", "Title", "Remarks", "Description", "Contact Name", "Billing Party", "Shipping Party"]
        const allowedType = ["assets", "liabilities", "equity", "income", "expenses"];
        const allowedSortBy = ["code", "name", "balance"];
        const allowedSortDir = ["asc", "desc"];

        const params = {};

        if (search && allowedSearch.includes(search) && search.length <= 100) params.search = search;
        if (type && allowedType.includes(type)) params.type = type;
        if (typeof is_archived === "boolean") params.is_archived = is_archived
        if (sort_by && allowedSortBy.includes(sort_by)) params.sort_by = sort_by;
        if (sort_dir && allowedSortDir.includes(sort_dir)) params.sort_dir = sort_dir;

        const accountInfo = await api.get('/accounts', { params });
        res.json(accountInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch account" });
    }
}

const getAccount = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/accounts/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch account" });
    }
}

module.exports = {
    getAccountList,
    getAccount
}