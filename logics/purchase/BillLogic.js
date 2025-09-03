const axios = require('axios')
const accessToken = process.env.BUKKU_ACCESS_TOKEN
const subdomain = process.env.SUBDOMAIN
const url = process.env.BUKKU_API_URL

const api = axios.create({
  baseURL: `${url}/purchases`,
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Company-Subdomain": subdomain,
    "Accept": "application/json"
  }
});

const getBillList = async(req, res) => {
    try {
        const {
            payment_status,
            date_from,
            date_to,
            search,
            custom_search,
            contact_id,
            payment_mode,
            status,
            sort_by,
            sort_dir,
            page = 1,
            page_size = 30,
        } = req.query;

        const allowedPayment = ["PAID", "OUTSTANDING", "OVERDUE"]
        const allowedSearch = ["No.", "Reference No.", "Title", "Remarks", "Description", "Contact Name", "Billing Party", "Shipping Party"]
        const allowedMode = ["credit", "cash", "claim"]
        const allowedStatus = ["draft", "pending_approval", "ready", "void"];
        const allowedSortBy = ["number", "date", "contact_name", "number2", "title", "description", "amount", "created_at"];
        const allowedSortDir = ["asc", "desc"];

        const params = {
            page: Number(page) >= 1 ? Number(page) : 1,
            page_size: Number(page_size) > 0 ? Number(page_size) : 30,
        };

        if (payment_status && allowedPayment.includes(payment_status)) params.payment_status = payment_status
        if (search && allowedSearch.includes(search) && search.length <= 100) params.search = search;
        if (custom_search && custom_search.length <= 100) params.custom_search = custom_search;
        if (contact_id && !isNaN(contact_id)) params.contact_id = Number(contact_id);
        if (payment_mode && allowedMode.includes(payment_mode)) params.payment_mode = payment_mode
        if (date_from) params.date_from = date_from; // can add stricter regex for YYYY-MM-DD
        if (date_to) params.date_to = date_to;
        if (status && allowedStatus.includes(status)) params.status = status;
        if (sort_by && allowedSortBy.includes(sort_by)) params.sort_by = sort_by;
        if (sort_dir && allowedSortDir.includes(sort_dir)) params.sort_dir = sort_dir;

        const billInfo = await api.get('bills', { params });
        res.json(billInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch bills" });
    }
}

module.exports = {
    getBillList
}