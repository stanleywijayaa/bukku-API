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
    
    try {


    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create orders" });
    }
}

// const createProductAttribute = async (req, res) => {
//     if (!req?.body?.name || !req?.body?.slug || !req?.body?.position) {
//         return res.status(400).json({ 'message': 'Name, slug, position required'});
//     }
//     try {
//         const response = await api.post('products/attributes', {
//             name: req.body.name,
//             slug: req.body.slug,
//             position: req.body.position
//         });
//         res.status(201).json(response.data)
//     } catch (err){
//         console.error('❌ Failed:', err.response?.data || err.message || err)
//     }
// }

module.exports = {
    getOrderList,
    getOrder
};