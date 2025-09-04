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
        const allowedSortBy = ["number", "date", "contact_name", "number2", "balance", "description", "amount", "created_at"];
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

        const creditInfo = await api.get('/credit_notes', { params });
        res.json(creditInfo.data);
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

const updateCredit = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID is required.'});
    try {
        await api.get(`/credit_notes/${req.body.id}`);

        const allowedTaxMode = ["inclusive", "exclusive"];
        const allowedInvois = ["NORMAL", "VALIDATE", "EXTERNAL"]
        const payload = {};

        if (req.body.number && req.body.number.length <= 50) payload.number = req.body.number;
        if (req.body.number2 && req.body.number2.length <= 50) payload.number2 = req.body.number2;
        if (req.body.date) payload.date = req.body.date;
        if (req.body.currency_code) payload.currency_code = req.body.currency_code;
        if (typeof req.body.exchange_rate === "number") payload.exchange_rate = req.body.exchange_rate;
        if (req.body.billing_party) payload.billing_party = req.body.billing_party;
        if (Array.isArray(req.body.tag_ids) && req.body.tag_ids.length <= 4) payload.tag_ids = req.body.tag_ids;
        if (req.body.description && req.body.description.length <= 255) payload.description = req.body.description;
        if (req.body.remarks) payload.remarks = req.body.remarks;
        if (req.body.tax_mode) {
            if (!allowedTaxMode.includes(req.body.tax_mode)) {
                return res.status(400).json({ message: "Invalid tax_mode value" });
            }
            payload.tax_mode = req.body.tax_mode;
        }

        if (Array.isArray(req.body.form_items) && req.body.form_items.length > 0) {
            payload.form_items = req.body.form_items;
        }
        if (req.body.link_items) payload.link_items = req.body.link_items
        if (Array.isArray(req.body.files)) payload.files = req.body.files;
        if (req.body.myinvois_action) {
            if (!allowedInvois.includes(req.body.myinvois_action)){
                return res.status(400).json({message: "Invalid invois"})
            }
            payload.myinvois_action = req.body.myinvois_action
        }

        const result = await api.put(`/credit_notes/${req.body.id}`, payload);
        res.json(result.data);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase credit matches ID ${req.body.id}` });
        }
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update credits" });
    }
}

const updateCreditStatus = async (req, res) => {
    const {id, status, void_reason} = req.body
    if (!id || !status) return res.status(400).json({ "message": "ID and status are required"})
    const allowedTransitions = {
        draft: ['pending_approval', 'ready'],
        pending_approval: ['ready'],
        ready: ['void'],
        void: ['ready']
    }
    try {
        const credit = await api.get(`/credit_notes/${id}`)
        const currentStatus = credit.data.status
        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({ "message": `Invalid status transition from ${currentStatus} → ${status}`})
        }
        const payload = {status}
        if (status === 'void'){
            if(!void_reason) return res.status(400).json({ "message": "void_reason is required when voiding a transaction." });
            payload.void_reason = void_reason
        }
        const result = await api.patch(`/credit_notes/${id}`, payload)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase credit matches ID ${id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update purchase credit status" });
    }
}

const deleteCredit = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({"message": "Credit ID required"})
    try {
        const order = await api.get(`/credit_notes/${req.body.id}`)
        const status = order.data?.status
        if (!['draft', 'void'].includes(status)) {
            return res.status(400).json({
                "message": `Bill with ID ${req.body.id} cannot be deleted because its status is '${status}'. Only 'draft' or 'void' bills can be deleted.`
            });
        }

        const result = await api.delete(`/credit_notes/${req.body.id}`)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase credit matches ID ${req.body.id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to delete purchase credit status" });
    }
}


module.exports = {
    getCreditList,
    getCredit,
    createCredit,
    updateCredit,
    updateCreditStatus,
    deleteCredit
}