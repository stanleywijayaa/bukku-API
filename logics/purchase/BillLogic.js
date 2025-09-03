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

const getBill = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/bills/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch bills" });
    }
}

const createBill = async(req, res) => {
    const {
        payment_mode,
        contact_id,
        contact2_id,
        number,
        number2,
        date,
        term_id,
        due_date,
        currency_code,
        exchange_rate,
        billing_party,
        tag_ids,
        description,
        remarks,
        tax_mode,
        form_items,
        deposit_items,
        status,
        files,
        customs_form_no,
        customs_k2_form_no,
        incoterms,
        myinvois_action
    } = req.body

    if (!payment_mode || !contact_id || !date || !currency_code || !exchange_rate || !tax_mode || !form_items || !status) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const allowedMode = ["cash", "credit", "claim"]
    const allowedTaxMode = ["inclusive", "exclusive"]
    const allowedStatus = ["draft", "pending_approval", "ready"];

    if (!allowedMode.includes(payment_mode)) {
        return res.status(400).json({ message: `Invalid payment_mode. Allowed: ${allowedMode.join(", ")}` });
    }
    if (!allowedTaxMode.includes(tax_mode)) {
        return res.status(400).json({ message: `Invalid tax_mode. Allowed: ${allowedTaxMode.join(", ")}` });
    }
    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatus.join(", ")}` });
    }

    try {
        const allowedInvois = ["NORMAL", "VALIDATE", "EXTERNAL"];

        const payload = {
            payment_mode,
            contact_id,
            date,
            currency_code,
            exchange_rate,
            tax_mode,
            form_items,
            status
        };
        if (contact2_id) payload.contact2_id = contact2_id
        if (number && number.length <= 50) payload.number = number;
        if (number2 && number2.length <= 50) payload.number2 = number2;
        if (term_id) payload.term_id = term_id;
        if (due_date) payload.due_date = due_date;
        if (billing_party) payload.billing_party = billing_party;
        if (Array.isArray(tag_ids) && tag_ids.length <= 4) payload.tag_ids = tag_ids;
        if (description && description.length <= 255) payload.description = description;
        if (remarks) payload.remarks = remarks;
        if (deposit_items) payload.deposit_items = deposit_items;
        if (files) payload.files = files;
        if (customs_form_no) payload.customs_form_no = customs_form_no
        if (customs_k2_form_no) payload.customs_k2_form_no = customs_k2_form_no
        if (incoterms) payload.incoterms = incoterms
        if (myinvois_action && allowedInvois.includes(myinvois_action)) payload.myinvois_action = myinvois_action

        const response = await api.post('/bills', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create bills" });
    }
}


module.exports = {
    getBillList,
    getBill,
    createBill
}