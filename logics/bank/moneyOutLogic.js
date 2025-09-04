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

const allowedTaxMode = ["inclusive", "exclusive"];
const allowedStatus = ["draft", "pending_approval", "ready", "void"];
const allowedEmailStatus = ["UNSENT", "PENDING", "SENT", "BOUNCED", "OPENED", "VIEWED"];
const allowedSortBy = ["number", "number2", "date", "contact_name", "amount", "description", "created_at"];
const allowedSortDir = ["asc", "desc"];
const allowedTransitions = {
        draft: ['pending_approval', 'ready'],
        pending_approval: ['ready'],
        ready: ['void'],
        void: ['ready']
    }


const createMoneyOut = async(req, res) => {
    const{ 
        contact_id, 
        billing_party, 
        billing_contact_person_id, 
        billing_contact_person, 
        number, 
        number2, 
        date, 
        currency_code, 
        exchange_rate, 
        tax_mode, 
        bank_items, 
        rounding_on, 
        description,
        internal_note,
        remarks,
        tag_ids, 
        files, 
        status, 
        deposit_items
    } = req.body;
    if(!number || !date || !currency_code || !exchange_rate || !bank_items || !rounding_on || !status || !deposit_items){
        return res.status(400).json({message: 'please fill in the required data'});
    }

    if (!allowedTaxMode.includes(tax_mode)) {
        return res.status(400).json({ message: `Invalid tax_mode. Allowed: ${allowedTaxMode.join(", ")}` });
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
        bank_items,
        rounding_on,
        status,
        deposit_items
    }
    if(contact_id)payload.contact_id = contact_id;
    if(billing_party)payload.billing_party = billing_party;
    if(billing_contact_person_id)payload.billing_contact_person_id = billing_contact_person_id;
    if(billing_contact_person)payload.billing_contact_person = billing_contact_person;
    if(number2 && number2.length <= 50)payload.number2 = number2;
    if(tax_mode)payload.tax_mode = payload.tax_mode = tax_mode;
    if(description && description.length <= 255)payload.description = description;
    if(internal_note)payload.internal_note = internal_note;
    if(remarks)payload.remarks = remarks;
    if(tag_ids && tag_ids.length <= 4)payload.tag_ids = tag_ids;
    if(files)payload.files = files;

    try {
        const response = await api.post('/expenses', payload)
        res.json(response.data);
    } catch (err) {
        console.error('Failed:', err.response?.data || err.message || err)
        res.status(500).json({message: 'error creating money out entry'})
    }
} 

const getMoneyOutList = async (req, res) => {
  const {
      date_from,
      date_to,
      search,
      contact_id,
      account_id,
      status,
      email_status,
      page = 1,
      page_size = 30,
      sort_by,
      sort_dir,
    } = req.query;

    const params = {
      page: Number(page) >= 1 ? Number(page) : 1,
      page_size: Number(page_size) > 0 ? Number(page_size) : 30,
    };

    if (date_from) params.date_from = date_from;
    if (date_to) params.date_to = date_to;
    if (search && search.length <= 100) params.search = search;
    if (contact_id && !isNaN(contact_id)) params.contact_id = Number(contact_id);
    if (account_id && !isNaN(account_id)) params.account_id = Number(account_id);
    if (status && allowedStatus.includes(status)) params.status = status;
    if (email_status && allowedEmailStatus.includes(email_status)) params.email_status = email_status;
    if (sort_by && allowedSortBy.includes(sort_by)) params.sort_by = sort_by;
    if (sort_dir && allowedSortDir.includes(sort_dir)) params.sort_dir = sort_dir;

    try {
    const response = await api.get("/expenses", {params});

    res.json(response.data);
  } catch (err) {
    console.error("Failed", err.response?.data || err.message || err);
    res.status(500).json({
      message: "Failed to fetch money-out list",
      error: err.response?.data || err.message,
    });
  }
};

const getMoneyOut = async(req, res) => {
    const { transactionId } = req.params;
    if (!transactionId || isNaN(transactionId)) {
      return res.status(400).json({ message: "transactionId is required and must be a number" });
    }
    try{
        const response = await api.get(`/expenses/${transactionId}`);
        res.json(response.data);
    }catch(err){
        console.error('Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch money out record" });
    }
}

const updateMoneyOut = async (req, res) => {
  const { transactionId } = req.params;
    if (!transactionId || isNaN(transactionId)) {
      return res.status(400).json({ message: "transactionId is required and must be a number" });
    }

    const {
      contact_id,
      billing_party,
      billing_contact_person_id,
      billing_contact_person,
      number,
      number2,
      date,
      currency_code,
      exchange_rate,
      tax_mode,
      bank_items,
      rounding_on,
      description,
      internal_note,
      remarks,
      tag_ids,
      files,
      status,
      deposit_items,
    } = req.body;

    // Minimal validation before sending to Bukku
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
    if (!bank_items || !Array.isArray(bank_items) || bank_items.length === 0) {
      return res.status(400).json({ message: "At least one bank item is required" });
    }
    if (typeof rounding_on !== "boolean") {
      return res.status(400).json({ message: "rounding_on must be true or false" });
    }
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    if (!deposit_items || !Array.isArray(deposit_items) || deposit_items.length === 0) {
      return res.status(400).json({ message: "At least one deposit item is required" });
    }

    // ✅ Construct payload
    const payload = {
      contact_id,
      billing_party,
      billing_contact_person_id,
      billing_contact_person,
      number,
      number2,
      date,
      currency_code,
      exchange_rate,
      tax_mode,
      bank_items,
      rounding_on,
      description,
      internal_note,
      remarks,
      tag_ids,
      files,
      status,
      deposit_items,
    };

    try {
    const response = await api.put(`/expenses/${transactionId}`, payload);

    res.json(response.data);
  } catch (err) {
    console.error("Failed", err.response?.data || err.message || err);
    res.status(500).json({
      message: "Failed to update money-out transaction",
      error: err.response?.data || err.message,
    });
  }
};

const updateMoneyOutStatus = async(req, res) => {
  const { transactionId, status, void_reason} = req.body;
  if(!transactionId)return res.status(400).json({message: 'transaction id is required'});
  try{
    const record = await api.get(`/incomes/${transactionId}`);
    const curStatus = record.data.status;
    if (!allowedTransitions[curStatus]?.includes(status)) {
            return res.status(400).json({ "message": `Invalid status transition from ${curStatus} → ${status}`})
        }
        const payload = {status}
        if (status === 'void'){
            if(!void_reason) return res.status(400).json({ "message": "void_reason is required when voiding a transaction." });
            payload.void_reason = void_reason
        }
        const result = await api.patch(`/expenses/${transactionId}`, payload)
        res.json(result.data)
  }catch(err){
    console.error("Failed", err.response?.data || err.message || err)
    res.status(500).json({
      message: "Failed to update money-out status",
      error: err.response?.data || err.message,
    });
  }
}

const deleteMoneyOut = async(req, res) => {
  const { transactionId } = req.params;
  if(!transactionId) return res.status(400).json({message: 'transaction id is required'});

  try{
    const record = await api.get(`/expenses/${transactionId}`)
    const curStatus = record.data.status;

    if (!["draft", "void"].includes(curStatus)) {
      return res.status(400).json({
        message: `Cannot delete transaction with status "${curStatus}". Only draft and void can be deleted.`,
      });
    }
    const response = await api.delete(`/expenses/${transactionId}`);
    res.json(response.data)
  }catch(err){
    console.error("Failed", err.response?.data || err.message || err);
    res.status(500).json({
      message: "Failed to delete money-in transaction",
      error: err.response?.data || err.message,
    });
  }
}

module.exports = {
    createMoneyOut,
    getMoneyOutList,
    getMoneyOut,
    updateMoneyOut,
    updateMoneyOutStatus,
    deleteMoneyOut
}