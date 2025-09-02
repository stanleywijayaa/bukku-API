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
        const {page = 1, limit = 20} = req.query
        const orderInfo = await api.get('/orders',{
            params: {page, limit}
        })
        res.json(orderInfo.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
}

const getOrder = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`orders/${id}`)
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
        if (number) payload.number = number;
        if (number2) payload.number2 = number2;
        if (billing_party) payload.billing_party = billing_party;
        if (show_shipping) payload.show_shipping = show_shipping;
        if (shipping_party) payload.shipping_party = shipping_party;
        if (shipping_info) payload.shipping_info = shipping_info;
        if (tag_ids) payload.tag_ids = tag_ids;
        if (term_id) payload.term_id = term_id;
        if (title) payload.title = title;
        if (description) payload.description = description;
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

module.exports = {
    getOrderList,
    getOrder,
    createOrder
};