const api = "https://api.bukku.fyi/banking/incomes";
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

//create
const createMoneyIn = async(req, res) => {
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
    if(
    !number || !date || !currency_code || !exchange_rate || 
    !bank_items || !rounding_on || !status || !deposit_items
    ){
        return res.status(400).json({message: 'please fill in the required data'});
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


} 

//get all list (but can search based on parameters)

//get list

//update (put)

//update status (patch)

//delete