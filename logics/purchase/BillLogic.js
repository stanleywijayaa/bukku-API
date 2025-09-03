const api = require('./purchaseAPI')

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

        const billInfo = await api.get('/bills', { params });
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

const updateBill = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID is required.'});
    try {
        await api.get(`/bills/${req.body.id}`);

        const allowedMode = ["cash", "credit", "claim"]
        const allowedTaxMode = ["inclusive", "exclusive"];
        const allowedInvois = ["NORMAL", "VALIDATE", "EXTERNAL"]
        const payload = {};

        if (req.body.payment_mode) {
            if (!allowedMode.includes(req.body.payment_mode)){
                return res.status(400).json({message: "Invalid payment_mode value"})
            }
            payload.payment_mode = req.body.payment_mode
        }
        if (req.body.contact2_id) payload.contact2_id = req.body.contact2_id
        if (req.body.number && req.body.number.length <= 50) payload.number = req.body.number;
        if (req.body.number2 && req.body.number2.length <= 50) payload.number2 = req.body.number2;
        if (req.body.date) payload.date = req.body.date;
        if (req.body.term_id) payload.term_id = req.body.term_id;
        if (req.body.due_date) payload.due_date = req.body.due_date
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
        if (req.body.deposit_items) payload.deposit_items = req.body.deposit_items
        if (Array.isArray(req.body.files)) payload.files = req.body.files;
        if (req.body.customs_form_no) payload.customs_form_no = req.body.customs_form_no
        if (req.body.customs_k2_form_no) payload.customs_k2_form_no = req.body.customs_k2_form_no
        if (req.body.incoterms) payload.incoterms = req.body.incoterms
        if (req.body.myinvois_action) {
            if (!allowedInvois.includes(req.body.myinvois_action)){
                return res.status(400).json({message: "Invalid invois"})
            }
            payload.myinvois_action = req.body.myinvois_action
        }

        const result = await api.put(`/bills/${req.body.id}`, payload);
        res.json(result.data);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase bills matches ID ${req.body.id}` });
        }
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update bills" });
    }
}

const updateBillStatus = async (req, res) => {
    const {id, status, void_reason} = req.body
    if (!id || !status) return res.status(400).json({ "message": "ID and status are required"})
    const allowedTransitions = {
        draft: ['pending_approval', 'ready'],
        pending_approval: ['ready'],
        ready: ['void'],
        void: ['ready']
    }
    try {
        const order = await api.get(`/bills/${id}`)
        const currentStatus = order.data.status
        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({ "message": `Invalid status transition from ${currentStatus} → ${status}`})
        }
        const payload = {status}
        if (status === 'void'){
            if(!void_reason) return res.status(400).json({ "message": "void_reason is required when voiding a transaction." });
            payload.void_reason = void_reason
        }
        const result = await api.patch(`/bills/${id}`, payload)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase bills matches ID ${id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update purchase bills status" });
    }
}

const deleteBill = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({"message": "Delete ID required"})
    try {
        const bill = await api.get(`/bills/${req.body.id}`)
        const status = bill.data?.status
        if (!['draft', 'void'].includes(status)) {
            return res.status(400).json({
                "message": `Bill with ID ${req.body.id} cannot be deleted because its status is '${status}'. Only 'draft' or 'void' bills can be deleted.`
            });
        }
        const result = await api.delete(`/bills/${req.body.id}`)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase bills matches ID ${req.body.id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to delete purchase bills status" });
    }
}

module.exports = {
    getBillList,
    getBill,
    createBill,
    updateBill,
    updateBillStatus,
    deleteBill
}