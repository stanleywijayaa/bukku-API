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