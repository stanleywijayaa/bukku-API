const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

//API call template
const api = axios.create({
    baseURL: `${process.env.BUKKU_API_URL}contacts/`,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `bearer ${process.env.BUKKU_ACCESS_TOKEN}`,
        'Company-Subdomain': process.env.SUBDOMAIN
    }
})

//Create contact
const createContact = async (req, res) => {
    //Get the data
    const rawData = req.body
    if (!rawData) return res.status(400).json({ message: "Missing request body" });

}

//Validate request
function verifyRequest(rawData, action) {
    //Define the allowed parameters
    const createupdateParams = [
        "entity_type","legal_name","other_name","reg_no_type","reg_no", "old_reg_no","tax_id_no",
        "sst_reg_no","contact_persons","group_ids","price_level_id","email","phone_no","types",
        "tag_ids","default_currency_code","default_term_id","default_income_account_id",
        "default_expense_account_id","fields","remarks","receive_monthly_statement",
        "receive_invoice_reminder","key","addresses","receivable_account_id",
        "debtor_credit_limit","payable_account_id","files"
    ]
    const whitelist = {
        create: createupdateParams,
        update: createupdateParams,
        read:   [ "group_id","search","page","page_size","sort_by",
                  "sort_dir","status","is_myinvois_ready","type" ],
        patch:  [ "is_archived" ]
    }
    //Get only valid parameters
    let data = Object.fromEntries(
        Object.entries(rawData).filter(([param]) => whitelist[action].includes(param))
    );

    //Define the required parameters
    const required = {
        create: [ "entity_type", "legal_name", "types" ],
        update: [ "entity_type", "legal_name", "types" ],
        read:   [],
        patch:  [ "is_archived" ]
    }
    //Check for required parameters
    const provided = Object.keys(data);
    const missing = required[action].filter(param => !provided.includes(param));
    //Return missing parameter(s) message
    if (missing.length > 0) return { bool: false, status: 400, message: `Missing required parameter(s): ${missing.join(", ")}`}

    //Validate parameters
    if (action === "create" || action === "update"){
        if(!["MALAYSIAN_COMPANY", "GENERAL_PUBLIC", "MALAYSIAN_INDIVIDUAL", "FOREIGN_COMPANY", "FOREIGN_INDIVIDUAL", "EXEMPTED_PERSON"].includes(data.entity_type)) return {bool: false, status: 400, message: 'Invalid entity type'}
        if(data.legal_name.length > 100) return {bool: false, status: 400, message: 'Legal name cannot be more than 100 characters'}
        if(data.other_name.length > 100) return {bool: false, status: 400, message: 'Other name cannot be more than 100 characters'}
        if(["MALAYSIAN_COMPANY"].includes(data.entity_type)){
            if(!data.reg_no_type || !data.reg_no || !data.tax_id_no) return { bool: false, status: 400, message: 'Missing required parameter(s)'}
        }
        else if (["MALAYSIAN_INDIVIDUAL", "FOREIGN_COMPANY"].includes(data.entity_type)){
            if(!(data.reg_no_type && data.reg_no) && !data.tax_id_no) return { bool: false, status: 400, message: 'Missing required parameter(s)'}
        }
        if((data.reg_no_type || data.reg_no) && (!data.reg_no_type || !data.reg_no)){
            return { bool: false, status: 400, message: 'Missing required parameter(s)'}
        }
        if(data.reg_no.length > 30) return {bool: false, status: 400, message: 'Registration number cannot be more than 30 characters'}
        if(!["NRIC", "BRN", "PASSPORT", "ARMY"].includes(data.reg_no_type)) return {bool: false, status: 400, message: 'Invalid registration type'}
        if(data.tax_id_no.length > 14 || data.tax_id_no.length < 11) return {bool: false, status: 400, message: 'Invalid tax ID number'}
        
        return {bool: true, data}
    }
    else if (action === "read"){

    }
    else if (action === "patch"){

    }
    else {
        return {bool: false, status: 500, message: "Unknown action"}
    }
}