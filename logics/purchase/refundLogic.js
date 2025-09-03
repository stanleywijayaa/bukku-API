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

module.exports = {
    getRefundList,
    getRefund
}