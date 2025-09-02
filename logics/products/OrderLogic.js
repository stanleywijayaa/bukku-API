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

const getOrderList = async(req, res) => {
    try {
        const {
            search,
            custom_search,
            contact_id,
            date_from,
            date_to,
            status,
            email_status,
            transfer_status,
            page = 1,
            page_size = 30,
            sort_by,
            sort_dir
        } = req.query;

        const allowedSearch = ["No.", "Reference No.", "Title", "Remarks", "Description", "Contact Name", "Billing Party", "Shipping Party"]
        const allowedStatus = ["draft", "pending_approval", "ready", "void"];
        const allowedEmailStatus = ["UNSENT", "PENDING", "SENT", "BOUNCED", "OPENED", "VIEWED"];
        const allowedTransferStatus = ["ALL", "OUTSTANDING", "NOT_TRANSFERRED", "PARTIAL_TRANSFERRED", "TRANSFERRED"];
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
        if (email_status && allowedEmailStatus.includes(email_status)) params.email_status = email_status;
        if (transfer_status && allowedTransferStatus.includes(transfer_status)) params.transfer_status = transfer_status;
        if (sort_by && allowedSortBy.includes(sort_by)) params.sort_by = sort_by;
        if (sort_dir && allowedSortDir.includes(sort_dir)) params.sort_dir = sort_dir;

        const orderInfo = await api.get('/orders', { params });
        res.json(orderInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}

const getOrder = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/orders/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}

const createOrder = async(req, res) => {
    const {
        contact_id,
        number,
        number2,
        date,
        currency_code,
        exchange_rate,
        billing_party,
        show_shipping,
        shipping_party,
        shipping_info,
        tag_ids,
        term_id,
        title,
        description,
        remarks,
        tax_mode,
        form_items,
        status,
        email,
        files
    } = req.body

    if (!contact_id || !date || !currency_code || !exchange_rate || !tax_mode || !form_items || !status) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const allowedTaxMode = ["inclusive", "exclusive"]
    const allowedStatus = ["draft", "pending_approval", "ready"];

    if (!allowedTaxMode.includes(tax_mode)) {
        return res.status(400).json({ message: `Invalid tax_mode. Allowed: ${allowedTaxMode.join(", ")}` });
    }

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatus.join(", ")}` });
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
        if (show_shipping) payload.show_shipping = show_shipping;
        if (shipping_party) payload.shipping_party = shipping_party;
        if (shipping_info && shipping_info.length <= 100) payload.shipping_info = shipping_info;
        if (tag_ids && tag_ids.length <= 4) payload.tag_ids = tag_ids;
        if (term_id) payload.term_id = term_id;
        if (title && title.length <= 255) payload.title = title;
        if (description && description.length <= 255) payload.description = description;
        if (remarks) payload.remarks = remarks;
        if (email) payload.email = email;
        if (files) payload.files = files;
        if (reference_no) payload.reference_no = reference_no;

        const response = await api.post('/orders', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create orders" });
    }
}

const updateOrder = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID is required.'});
    try {
        await api.get(`/orders/${req.body.id}`);

        const allowedTaxMode = ["inclusive", "exclusive"];
        const payload = {};

        if (req.body.number && req.body.number.length <= 50) payload.number = req.body.number;
        if (req.body.number2 && req.body.number2.length <= 50) payload.number2 = req.body.number2;
        if (req.body.date) payload.date = req.body.date;
        if (req.body.currency_code) payload.currency_code = req.body.currency_code;
        if (typeof req.body.exchange_rate === "number") payload.exchange_rate = req.body.exchange_rate;
        if (req.body.billing_party) payload.billing_party = req.body.billing_party;
        if (typeof req.body.show_shipping === "boolean") payload.show_shipping = req.body.show_shipping;
        if (req.body.shipping_party) payload.shipping_party = req.body.shipping_party;
        if (req.body.shipping_info && req.body.shipping_info.length <= 100) payload.shipping_info = req.body.shipping_info;
        if (Array.isArray(req.body.tag_ids) && req.body.tag_ids.length <= 4) payload.tag_ids = req.body.tag_ids;
        if (req.body.term_id) payload.term_id = req.body.term_id;
        if (req.body.title && req.body.title.length <= 255) payload.title = req.body.title;
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

        if (req.body.email) payload.email = req.body.email;
        if (Array.isArray(req.body.files)) payload.files = req.body.files;

        const result = await api.put(`/orders/${req.body.id}`, payload);
        res.json(result.data);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase order matches ID ${req.body.id}` });
        }
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update orders" });
    }
}

const updateOrderStatus = async (req, res) => {
    const {id, status, void_reason} = req.body
    if (!id || !status) return res.status(400).json({ "message": "ID and status are required"})
    const allowedTransitions = {
        draft: ['pending_approval', 'ready'],
        pending_approval: ['ready'],
        ready: ['void'],
        void: ['ready']
    }
    try {
        const order = await api.get(`/orders/${id}`)
        const currentStatus = order.data.status
        if (!allowedTransitions[currentStatus]?.includes(status)) {
            return res.status(400).json({ "message": `Invalid status transition from ${currentStatus} → ${status}`})
        }
        const payload = {status}
        if (status === 'void'){
            if(!void_reason) return res.status(400).json({ "message": "void_reason is required when voiding a transaction." });
            payload.void_reason = void_reason
        }
        const result = await api.patch(`/orders/${id}`, payload)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase order matches ID ${id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update purchase order status" });
    }
}

const deleteOrder = async (req, res) => {
    if (!req?.body?.id) return res.status(400).json({"message": "Order ID required"})
    try {
        await api.get(`/orders/${req.body.id}`)
        const result = await api.delete(`/orders/${req.body.id}`)
        res.json(result.data)
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No purchase order matches ID ${req.body.id}` });
        }
        console.error("❌ Failed:", err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update purchase order status" });
    }
}


module.exports = {
    getOrderList,
    getOrder,
    createOrder,
    updateOrder,
    updateOrderStatus,
    deleteOrder
};