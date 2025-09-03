const api = require('./purchaseAPI')

const getPaymentList = async(req, res) => {
    try {
        const {
            search,
            custom_search,
            contact_id,
            date_from,
            date_to,
            status,
            payment_status,
            email_status,
            page = 1,
            page_size = 30,
            sort_by,
            sort_dir,
            account_id
        } = req.query;

        const allowedSearch = ["No.", "Reference No.", "Title", "Remarks", "Description", "Contact Name", "Billing Party", "Shipping Party"]
        const allowedStatus = ["draft", "pending_approval", "ready", "void"];
        const allowedPayment = ["paid", "outstanding"]
        const allowedEmailStatus = ["UNSENT", "PENDING", "SENT", "BOUNCED", "OPENED", "VIEWED"];
        const allowedSortBy = ["number", "date", "contact_name", "number2", "title", "description", "amount", "created_at"];
        const allowedSortDir = ["asc", "desc"];

        const params = {
            page: Number(page) >= 1 ? Number(page) : 1,
            page_size: Number(page_size) > 0 ? Number(page_size) : 30,
        };

        if (search && allowedSearch.includes(search) && search.length <= 100) params.search = search;
        if (custom_search && custom_search.length <= 100) params.custom_search = custom_search;
        if (contact_id && !isNaN(contact_id)) params.contact_id = Number(contact_id);
        if (date_from) params.date_from = date_from; // can add stricter regex for YYYY-MM-DD
        if (date_to) params.date_to = date_to;
        if (status && allowedStatus.includes(status)) params.status = status;
        if (payment_status && allowedPayment.includes(payment_status)) params.payment_status = payment_status
        if (email_status && allowedEmailStatus.includes(email_status)) params.email_status = email_status;
        if (sort_by && allowedSortBy.includes(sort_by)) params.sort_by = sort_by;
        if (sort_dir && allowedSortDir.includes(sort_dir)) params.sort_dir = sort_dir;
        if (account_id) params.account_id = account_id;

        const paymentInfo = await api.get('/payments', { params });
        res.json(paymentInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch payments" });
    }
}

const getPayment = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/payments/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch payments" });
    }
}

const createPayment = async(req, res) => {
    const {
        contact_id,
        number,
        number2,
        date,
        currency_code,
        exchange_rate,
        amount,
        tag_ids,
        description,
        remarks,
        link_items,
        deposit_items,
        status,
        email,
        files
    } = req.body

    if (!contact_id || !date || !currency_code || !exchange_rate || !amount || !deposit_items || !status) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const allowedStatus = ["draft", "pending_approval", "ready"];

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatus.join(", ")}` });
    }

    try {
        const payload = {
            contact_id,
            date,
            currency_code,
            exchange_rate,
            amount,
            deposit_items,
            status
        };
        if (number && number.length <= 50) payload.number = number;
        if (number2 && number2.length <= 50) payload.number2 = number2;
        if (tag_ids && tag_ids.length <= 4) payload.tag_ids = tag_ids;
        if (description && description.length <= 255) payload.description = description;
        if (remarks) payload.remarks = remarks;
        if (link_items) payload.link_items = link_items
        if (email) payload.email = email;
        if (files) payload.files = files;

        const response = await api.post('/payments', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create payments" });
    }
}

const updatePayment = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID is required.'});
    try {
        await api.get(`/payments/${req.body.id}`);
        const payload = {};

        if (req.body.number && req.body.number.length <= 50) payload.number = req.body.number;
        if (req.body.number2 && req.body.number2.length <= 50) payload.number2 = req.body.number2;
        if (req.body.date) payload.date = req.body.date;
        if (req.body.currency_code) payload.currency_code = req.body.currency_code;
        if (typeof req.body.exchange_rate === "number") payload.exchange_rate = req.body.exchange_rate;
        if (typeof req.body.amount === "number") payload.amount = req.body.amount;
        if (Array.isArray(req.body.tag_ids) && req.body.tag_ids.length <= 4) payload.tag_ids = req.body.tag_ids;
        if (req.body.description && req.body.description.length <= 255) payload.description = req.body.description;
        if (req.body.remarks) payload.remarks = req.body.remarks;
        if (Array.isArray(req.body.link_items)) payload.link_items = link_items
        if (Array.isArray(req.body.deposit_items)) payload.deposit_items = deposit_items
        if (req.body.email) payload.email = req.body.email;
        if (Array.isArray(req.body.files)) payload.files = req.body.files;

        const result = await api.put(`/payments/${req.body.id}`, payload);
        res.json(result.data);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase payments matches ID ${req.body.id}` });
        }
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update payments" });
    }
}

const updatePaymentStatus = async (req, res) => {
    const {id, status, void_reason} = req.body
    if (!id || !status) return res.status(400).json({ "message": "ID and status are required"})
    const allowedTransitions = {
        draft: ['pending_approval', 'ready'],
        pending_approval: ['ready'],
        ready: ['void'],
        void: ['ready']
    }
    try {
        const payment = await api.get(`/payments/${id}`)
        const currentStatus = payment.data.status
        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({ "message": `Invalid status transition from ${currentStatus} → ${status}`})
        }
        const payload = {status}
        if (status === 'void'){
            if(!void_reason) return res.status(400).json({ "message": "void_reason is required when voiding a transaction." });
            payload.void_reason = void_reason
        }
        const result = await api.patch(`/payments/${id}`, payload)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase payment matches ID ${id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update purchase payment status" });
    }
}

module.exports = {
    getPaymentList,
    getPayment,
    createPayment,
    updatePayment,
    updatePaymentStatus
}