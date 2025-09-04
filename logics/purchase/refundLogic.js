const api = require('./purchaseAPI')

const getRefundList = async(req, res) => {
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
        const allowedSortBy = ["number", "date", "contact_name", "number2", "description", "amount", "created_at"];
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

        const refundInfo = await api.get('/refunds', { params });
        res.json(refundInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch refunds" });
    }
}

const getRefund = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/refunds/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch refunds" });
    }
}

const createRefund = async(req, res) => {
    const {
        contact_id,
        number,
        number2,
        date,
        currency_code,
        exchange_rate,
        tag_ids,
        description,
        remarks,
        link_items,
        deposit_items,
        status,
        email,
        files
    } = req.body

    if (!contact_id || !date || !currency_code || !exchange_rate || !deposit_items || !status) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (isNaN(Number(contact_id))) return res.status(400).json({ message: `contact_id must be number.`})
    if (isNaN(Number(exchange_rate))) return res.status(400).json({ message: `exchange_rate must be number`})
    if (!Array.isArray(deposit_items) && deposit_items.every(f => typeof f === "object" && f !== null && !Array.isArray(f))) {
        return res.status(400).json({ message: `form_items must be array`})
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
            deposit_items,
            status
        };
        if (number && number.length <= 50) payload.number = number;
        if (number2 && number2.length <= 50) payload.number2 = number2;
        if (Array.isArray(tag_ids) && tag_ids.length <= 4) payload.tag_ids = tag_ids;
        if (description && description.length <= 255) payload.description = description;
        if (remarks) payload.remarks = remarks;
        if (Array.isArray(link_items) && link_items.every(f => typeof f === "object" && f !== null && !Array.isArray(f))) payload.link_items = link_items
        if (email && typeof email === "object" && !Array.isArray(email)) payload.email = email;
        if (Array.isArray(files) && files.every(f => typeof f === "object" && f !== null && !Array.isArray(f))) payload.files = files;

        const response = await api.post('/refunds', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create refunds" });
    }
}

const updateRefund = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID is required.'});
    try {
        await api.get(`/refunds/${req.body.id}`);
        const payload = {};

        if (req.body.number && req.body.number.length <= 50) payload.number = req.body.number;
        if (req.body.number2 && req.body.number2.length <= 50) payload.number2 = req.body.number2;
        if (req.body.date) payload.date = req.body.date;
        if (req.body.currency_code) payload.currency_code = req.body.currency_code;
        if (typeof req.body.exchange_rate === "number") payload.exchange_rate = req.body.exchange_rate;
        if (Array.isArray(req.body.tag_ids) && req.body.tag_ids.length <= 4) payload.tag_ids = req.body.tag_ids;
        if (req.body.description && req.body.description.length <= 255) payload.description = req.body.description;
        if (req.body.remarks) payload.remarks = req.body.remarks;
        if (Array.isArray(req.body.link_items) && req.body.link_items.every(f => typeof f === "object" && f !== null && !Array.isArray(f))) {
            payload.link_items = link_items
        }
        if (Array.isArray(req.body.deposit_items) && req.body.deposit_items.every(f => typeof f === "object" && f !== null && !Array.isArray(f))) {
            payload.deposit_items = deposit_items
        }
        if (req.body.email && typeof req.body.email === "object" && !Array.isArray(req.body.email)) payload.email = req.body.email;
        if (Array.isArray(req.body.files) && req.body.files.every(f => typeof f === "object" && f !== null && !Array.isArray(f))) {
            payload.files = req.body.files;
        }

        const result = await api.put(`/refunds/${req.body.id}`, payload);
        res.json(result.data);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase refunds matches ID ${req.body.id}` });
        }
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update refunds" });
    }
}

const updateRefundStatus = async (req, res) => {
    const {id, status, void_reason} = req.body
    if (!id || !status) return res.status(400).json({ "message": "ID and status are required"})
    const allowedTransitions = {
        draft: ['pending_approval', 'ready'],
        pending_approval: ['ready'],
        ready: ['void'],
        void: ['ready']
    }
    try {
        const refund = await api.get(`/refunds/${id}`)
        const currentStatus = refund.data.status
        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({ "message": `Invalid status transition from ${currentStatus} → ${status}`})
        }
        const payload = {status}
        if (status === 'void'){
            if(!void_reason) return res.status(400).json({ "message": "void_reason is required when voiding a transaction." });
            payload.void_reason = void_reason
        }
        const result = await api.patch(`/refunds/${id}`, payload)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase refunds matches ID ${id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update purchase refunds status" });
    }
}

const deleteRefund = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({"message": "Refund ID required"})
    try {
        const refund = await api.get(`/refunds/${req.body.id}`)
        const status = refund.data?.status
        if (!['draft', 'void'].includes(status)) {
            return res.status(400).json({
                "message": `Refund with ID ${req.body.id} cannot be deleted because its status is '${status}'. Only 'draft' or 'void' bills can be deleted.`
            });
        }

        const result = await api.delete(`/refunds/${req.body.id}`)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase refunds matches ID ${req.body.id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to delete purchase refund status" });
    }
}

module.exports = {
    getRefundList,
    getRefund,
    createRefund,
    updateRefund,
    updateRefundStatus,
    deleteRefund
}