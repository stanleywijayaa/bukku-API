const axios = require("axios");
const url = process.env.BUKKU_API_URL;
const subdomain = process.env.SUBDOMAIN
const accessToken = process.env.BUKKU_ACCESS_TOKEN;
const dotenv = require('dotenv');
dotenv.config();

const api = axios.create({
    baseURL: `${url}/banking`,
    headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Company-Subdomain": subdomain,
    "Accept": "application/json"
  }
});

const allowedStatus = ["draft", "pending_approval", "ready", "void"];
const allowedTransitions = {
        draft: ['pending_approval', 'ready'],
        pending_approval: ['ready'],
        ready: ['void'],
        void: ['ready']
    }

const createTransaction = async(req, res) => {
    const{ 
        number, 
        number2, 
        date, 
        currency_code, 
        exchange_rate,
        account_id,
        account_id2,
        amount,
        description,
        internal_note,
        remarks,
        tag_ids, 
        files, 
        status, 
    } = req.body;
    if(!number || !date || !currency_code || !exchange_rate || !account_id || !account_id2 || !amount || !status){
        return res.status(400).json({message: 'please fill in the required data'});
    }

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Allowed: ${allowedStatus.join(", ")}` });
    }

    if(number.length > 50){
        return res.status(400),json({message: 'number should not exceed 50 characters'});
    }

    const payload = {
        number,
        date,
        currency_node,
        exchange_rate,
        account_id,
        account_id2,
        amount,
        status
    }
    if(number2 && number2.length <= 50)payload.number2 = number2;
    if(description && description.length <= 255)payload.description = description;
    if(internal_note)payload.internal_note = internal_note;
    if(remarks)payload.remarks = remarks;
    if(tag_ids && tag_ids.length <= 4)payload.tag_ids = tag_ids;
    if(files)payload.files = files;

    try {
        const response = await api.post('/transfers', payload)
        res.json(response.data);
    } catch (err) {
        console.error('Failed:', err.response?.data || err.message || err)
        res.status(500).json({message: 'error creating transfer record'})
    }
} 