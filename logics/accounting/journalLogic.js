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

const getJournalList = async(req, res) => {
    try {
        const {
            date_from,
            date_to,
            search,
            status,
            page = 1,
            page_size = 30,
            sort_by,
            sort_dir,
        } = req.query;

        const allowedSearch = ["No.", "Reference No.", "Title", "Remarks", "Description"]
        const allowedStatus = ["draft", "pending_approval", "ready", "void"];
        const allowedSortBy = ["number", "date", "contact_name", "number2", "amount", "description", "title", "balance" ,"created_at"];
        const allowedSortDir = ["asc", "desc"];

        const params = {
            page: Number(page) >= 1 ? Number(page) : 1,
            page_size: Number(page_size) > 0 ? Number(page_size) : 30,
        };

        if (date_from) params.date_from = date_from; // can add stricter regex for YYYY-MM-DD
        if (date_to) params.date_to = date_to;
        if (search && allowedSearch.includes(search) && search.length <= 100) params.search = search;
        if (status && allowedStatus.includes(status)) params.status = status;
        if (sort_by && allowedSortBy.includes(sort_by)) params.sort_by = sort_by;
        if (sort_dir && allowedSortDir.includes(sort_dir)) params.sort_dir = sort_dir;

        const journalInfo = await api.get('/journal_entries', { params });
        res.json(journalInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch journal" });
    }
}

const getJournal = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/journal_entries/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch journal" });
    }
}

const createJournal = async(req, res) => {
    const {
        contact_id,
        currency_code,
        date,
        description,
        exchange_rate,
        files,
        internal_note,
        journal_items,
        number,
        number2,
        remarks,
        status,
        tag_ids
    } = req.body

    if ( !date || !currency_code || !exchange_rate || !journal_items || !status) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const allowedStatus = ["draft", "pending_approval", "ready"];
    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatus.join(", ")}` });
    }

    try {
        const payload = {
            date,
            currency_code,
            exchange_rate,
            journal_items,
            status
        };
        
        if (contact_id) payload.contact_id = contact_id
        if (description && description.length <= 255) payload.description = description;
        if (files) payload.files = files;
        if (internal_note) payload.internal_note = internal_note;
        if (number && number.length <= 50) payload.number = number;
        if (number2 && number2.length <= 50) payload.number2 = number2;
        if (remarks) payload.remarks = remarks;
        if (Array.isArray(tag_ids) && tag_ids.length <= 4) payload.tag_ids = tag_ids;
        
        const response = await api.post('/journal_entries', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create journal" });
    }
}

module.exports = {
    getJournalList,
    getJournal,
    createJournal
}