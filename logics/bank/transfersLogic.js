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

const getTransferList = async (req, res) => {
  const {
      date_from,
      date_to,
      search,
      account_id,
      status,
    } = req.query;

    const params = {};

    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;
    if (search && search.length <= 100) params.search = search;
    if (account_id && !isNaN(account_id)) params.account_id = Number(account_id);
    if (status && allowedStatus.includes(status)) params.status = status;

    try {
    const response = await api.get("/transfers", {params});
    res.json(response.data);
  } catch (err) {
    console.error("Failed", err.response?.data || err.message || err);
    res.status(500).json({
      message: "Failed to fetch transfer list",
      error: err.response?.data || err.message,
    });
  }
};

const getTransfer = async(req, res) => {
    const { transactionId } = req.params;
    if (!transactionId || isNaN(transactionId)) {
      return res.status(400).json({ message: "transactionId is required and must be a number" });
    }
    try{
        const response = await api.get(`/transfers/${transactionId}`);
        res.json(response.data);
    }catch(err){
        console.error('Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch transfer record" });
    }
}

const updateTransfer = async(req, res) => {
    const { transactionId } = req.params;
    if (!transactionId || isNaN(transactionId)) {
      return res.status(400).json({ message: "transactionId is required and must be a number" });
    }
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

    if (!number || number.length > 50) {
      return res.status(400).json({ message: "Transaction number is required and must be <= 50 characters" });
    }
    if (!date) {
      return res.status(400).json({ message: "Transaction date is required" });
    }
    if (!currency_code) {
      return res.status(400).json({ message: "Currency code is required" });
    }
    if (!exchange_rate) {
      return res.status(400).json({ message: "Exchange rate is required" });
    }
    if(!account_id) {
        return res.status(400).json({ message: "Source's account id is required"})
    }
    if(!account_id2) {
        return res.status(400).json({ message: "Destination's account id is required"})
    }
    if(!amount) {
        return res.status(400).json({ message: "Transfer amount is required"})
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const payload = {
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
    };

    try{
        const response = await api.put(`/transfers/${transactionId}`, payload);
        res.json(response.data);
    }catch(err){
        console.error("Failed", err.response?.data || err.message || err);
        res.status(500).json({
        message: "Failed to update Transfer",
        error: err.response?.data || err.message,
        });
    }
}