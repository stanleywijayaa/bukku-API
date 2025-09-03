const api = require('./purchaseAPI')

const getCreditList = async (req, res) => {
    try {
        const {
            payment_status,
            date_from,
            date_to,
            search,
            custom_search,
            contact_id,
            status,
            sort_by,
            sort_dir,
            page = 1,
            page_size = 20
        } = req.query

        const allowedPayment = ["PAID", "OUTSTANDING", "OVERDUE"]
        const allowedSearch = ["No.", "Reference No.", "Title", "Remarks", "Description", "Contact Name", "Billing Party", "Shipping Party"]
        const allowedStatus = ["draft", "pending_approval", "ready", "void"];
        const allowedSortBy = ["number", "date", "contact_name", "number2", "title", "description", "amount", "created_at"];
        const allowedSortDir = ["asc", "desc"];

        const params = {
            page: Number(page) >= 1 ? Number(page) : 1,
            page_size: Number(page_size) > 0 ? Number(page_size) : 30,
        };

        if (payment_status && allowedPayment.includes(payment_status)) params.payment_status = payment_status
        if (date_from) params.date_from = date_from; 
        if (date_to) params.date_to = date_to;
        if (search && allowedSearch.includes(search) && search.length <= 100) params.search = search;
        if (custom_search && custom_search.length <= 100) params.custom_search = custom_search;
        if (contact_id && !isNaN(contact_id)) params.contact_id = Number(contact_id);
        if (status && allowedStatus.includes(status)) params.status = status;
        if (sort_by && allowedSortBy.includes(sort_by)) params.sort_by = sort_by;
        if (sort_dir && allowedSortDir.includes(sort_dir)) params.sort_dir = sort_dir;

        const orderInfo = await api.get('/credit_notes', { params });
        res.json(orderInfo.data);
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch credit" });
    }
}

const getCredit = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/credit_notes/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch credit" });
    }
}

const createCredit = async(req, res) => {
    const {
        contact_id,
        number,
        number2,
        date,
        currency_code,
        exchange_rate,
        billing_party,
        tag_ids,
        description,
        remarks,
        tax_mode,
        form_items,
        link_items,
        status,
        files,
        customs_form_no,
        customs_k2_form_no,
        incoterms,
        myinvois_action
    } = req.body

    if (!contact_id || !date || !currency_code || !exchange_rate || !tax_mode || !form_items || !status) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const allowedTaxMode = ["inclusive", "exclusive"]
    const allowedStatus = ["draft", "pending_approval", "ready"];
    const allowedInvois = ["NORMAL", "VALIDATE", "EXTERNAL"]

    if (!allowedTaxMode.includes(tax_mode)) {
        return res.status(400).json({ message: `Invalid tax_mode. Allowed: ${allowedTaxMode.join(", ")}` });
    }

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatus.join(", ")}` });
    }

    if (!allowedInvois.includes(myinvois_action)) {
        return res.status(400).json({ message: `Invalid invois. Allowed: ${allowedStatus.join(", ")}` });
    }

    try {
        const payload = {
            contact_id,
            date,
            currency_code,
            exchange_rate,
            tax_mode,
            form_items,
            status
        };
        if (number && number.length <= 50) payload.number = number;
        if (number2 && number2.length <= 50) payload.number2 = number2;
        if (billing_party) payload.billing_party = billing_party;
        if (tag_ids && tag_ids.length <= 4) payload.tag_ids = tag_ids;
        if (description && description.length <= 255) payload.description = description;
        if (remarks) payload.remarks = remarks;
        if (link_items) payload.link_items = link_items
        if (files) payload.files = files;
        if (customs_form_no) payload.customs_form_no = customs_form_no
        if (customs_k2_form_no) payload.customs_k2_form_no = customs_k2_form_no
        if (incoterms) payload.incoterms = incoterms
        if (myinvois_action && allowedInvois.includes(myinvois_action)) payload.myinvois_action = myinvois_action

        const response = await api.post('/credit_notes', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create credit" });
    }
}

module.exports = {
    getCreditList,
    getCredit,
    createCredit
}