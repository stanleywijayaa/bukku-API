const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

//API call template
const api = axios.create({
    baseURL: `${process.env.BUKKU_API_URL}sales/`,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `bearer ${process.env.BUKKU_ACCESS_TOKEN}`,
        'Company-Subdomain': process.env.SUBDOMAIN
    }
})

//Create a sales
const createSales = async (req,res) => {
    //Determine the sales type
    const { type } = req.params
    //Get the parameters
    const data = req.body
    if(!data) return res.status(400).json({message: "Missing request body"})
    //Request validation
    const valid = verifyCreateRequest(data, type)
    if (!valid.bool){
        return res.status(valid.status).json({message: valid.message})
    }

    try {
        //Create the sales entry
        const response = await api.post(type, data)
        //Return the API response
        res.status(response.status).json({data: response.data})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: `Failed creating quotation${type}`, error})
    }
}

//List all sales
const getSalesList = async (req,res) => {
    //Determine the sales type
    const { type } = req.params
    //Get the raw params
    const rawParams = req.query
    //Request validation
    const valid = verifyGetRequest(rawParams, type)
    if (!valid.bool){
        return res.status(valid.status).json({message: valid.message})
    }
    //Get the valid parameters
    let params = valid.params

    //Get the data
    try{
        let data = []
        //Get only the page requested
        if (params.page) {
            //Get the data
            const response = await api.get(type, { params })
            const result = response.data
            //Append the data to data object
            data.push(...result.transactions)
        }
        //Get all pages if page is not specified
        else {
            let page = 1
            let totalPage = 1
            do {
                //Get the data
                const response = await api.get(type, { ...params, page })
                const result = response.data
                data.push(...result.transactions)
                //Get the total number of page
                totalPage = Math.ceil(result.paging.total / result.paging.per_page)
                //Iterate page
                page++
            }
            //Get all the data
            while(page <= totalPage)
        }
        //Return the data
        res.status(200).json({ data })
    }
    catch (error){
        console.error(error)
        return res.status(500).json({message: `Failed getting quotation${type}`, error})
    }
}

//Get a specific sales
const getSales = async (req,res) => {
    //Determine the sales type
    const { type } = req.params
    //Validate route
    if(!["quotes", "orders", "delivery_orders", "invoices", "credit_notes", "payments", "refunds"].includes(type)){
        return res.status(404).json({message: 'Invalid request'})
    }
    //Get the transaction id
    const id = req.query?.id
    //Check if the id exists
    if (!id) return res.status(400).json({message: 'ID is required'})
    
    try{
        //Get the sales
        const response = await api.get(`${type}/${id}`)
        const data = response.data
        //Return the sales
        res.status(response.status).json({data})
    }
    catch (error){
        console.error(error)
        return res.status(500).json({message: `Failed getting ${type}`, error})
    }
}

//Replace the sales entry
const updateSales = async (req,res) => {
    //Determine the sales type
    const { type } = req.params
    //Check if type exists
    if (!type) return res.status(400).json({message: 'Invalid route'})
    //Get the parameters
    const rawData = req.body
    //Request validation
    const valid = verifyUpdateRequest(rawData, type)
    if (!valid.bool){
        return res.status(valid.status).json({message: valid.message})
    }
    //Get the valid parameters
    let data = valid.data
    
    try {
        const { transactionId, ...payload } = data
        //Replace the sales entry
        const response = await api.put(`${type}/${transactionId}`, payload)
        //Return the API response
        res.status(response.status).json({data: response.data})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: `Failed updating ${type}`, error})
    }
}

//Update a sales status
const patchSales = async (req,res) => {
    //Determine the sales type
    const { type } = req.params
    //Get the transaction id
    const id = req.query?.id
    //Get the transaction status and reason if void
    const param = req.body
    //Check for valid request type
    if(!["quotes", "orders", "delivery_orders", "invoices", "credit_notes", "payments", "refunds"].includes(type)){
        return res.status(404).json({message: "Invalid request"})
    }
    //Check if the id and status exists
    if (!id) return res.status(400).json({message: 'ID is required'})
    if (!param?.status) return res.status(400).json({message: 'Status is required'})
    
    try{
        //Check if the transaction exists
        const transaction = await api.get(`${type}/${id}`)
        if (transaction.status != 200 || !transaction.data){
            return res.status(404).json({message: "Transaction ID is not found"})
        }

        //Check for the status of the current transaction entry
        const currentStatus = transaction.data?.transaction?.status;
        if (!currentStatus) {
            return res.status(500).json({ message: "No transaction status found in existing transaction" });
        }

        //Request validation
        const valid = verifyPatchRequest(param, currentStatus)
        if (!valid.bool) {
            return res.status(valid.status).json({ message: valid.message })
        }
        //Get the valid parameters
        let param = valid.data

        //Patch the sales
        const response = await api.patch(`${type}/${id}`, param)
        const data = response.data
        //Return the response
        res.status(response.status).json({data})
    }
    catch (error){
        console.error(error)
        return res.status(500).json({message: `Failed patching ${type}`, error})
    }
}

//Delete a sales entry
const deleteSales = async (req,res) => {
    //Determine the sales type
    const { type } = req.params
    //Validate route
    if(!["quotes", "orders", "delivery_orders", "invoices", "credit_notes", "payments", "refunds"].includes(type)){
        return res.status(404).json({message: 'Invalid request'})
    }
    const api = `${baseURL}${type}`
    //Get the transaction id
    const id = req.query?.id
    //Check if the id exists
    if (!id) return res.status(400).json({message: 'ID is required'})
    
    try{
        //Check the status of the transaction
        const transaction = await api.get(`${type}/${id}`)
        if (transaction.status != 'void' || transaction.status != 'draft'){
            return res.status(400).json({message: "Unable to delete transaction with status other than void or draft"})
        }
        //Delete the sales
        const response = await api.delete(`${type}/${id}`)
        //Return the sales
        res.status(response.status).json({data: true})
    }
    catch (error){
        console.error(error)
        return res.status(500).json({message: `Failed deleting ${type}`, error})
    }
}

//Verify request for creating sales entry
function verifyCreateRequest(params, type){
    //Validate route
    if(!["quotes", "orders", "delivery_orders", "invoices", "credit_notes", "payments", "refunds"].includes(type)){
        return {bool: false, status: 404, message: "Invalid request"}
    }
    //Define general parameters
    const generalWhitelist = [
        "contact_id","number","number2","date","currency_code",
        "exchange_rate","billing_party","show_shipping",
        "shipping_party","shipping_info","tag_ids","title",
        "description","remarks","tax_mode","status","email","files"
    ];
    //Define the type specific parameters
    const typeSpecificWhitelist = {
        quotes:         [...generalWhitelist, "term_id", "form_items"],
        orders:         [...generalWhitelist, "term_id", "form_items"],
        delivery_orders:[...generalWhitelist, "form_items"],
        invoices:       [...generalWhitelist, "payment_mode","term_items","deposit_items","customs_form_no","customs_k2_form_no","incoterms","myinvois_action","form_items"],
        credit_notes:   [...generalWhitelist, "link_items","customs_form_no","customs_k2_form_no","incoterms","myinvois_action","form_items"],
        payments:       [...generalWhitelist, "amount","link_items","deposit_items"],
        refunds:        [...generalWhitelist, "link_items","deposit_items"]
    };
    //Get only valid parameters
    let data = Object.fromEntries(
        Object.entries(params).filter(([param]) => typeSpecificWhitelist[type].includes(param))
    );

    //Define general required parameters
    const generalRequired = [
        "contact_id", "date", "currency_code",
        "exchange_rate", "status"
    ]
    //Define type specific required parameters
    const typeSpecificRequired = {
        quotes:         [...generalRequired, "tax_modes", "form_items"],
        orders:         [...generalRequired, "tax_modes", "form_items"],
        delivery_orders:[...generalRequired, "tax_modes", "form_items"],
        invoices:       [...generalRequired, "tax_modes", "form_items", "payment_mode"],
        credit_notes:   [...generalRequired, "tax_modes", "form_items"],
        payments:       [...generalRequired, "amount", "deposit_items"],
        payments:       [...generalRequired, "deposit_items"],
    }
    //Check for required parameters
    const provided = Object.keys(data);
    const missing = typeSpecificRequired[type].filter(param => !provided.includes(param));
    //Return missing parameter(s) message
    if (missing.length > 0) return { bool: false, status: 400, message: `Missing required parameter(s): ${missing.join(", ")}`}

    //Validate general parameters
    if(data.tag_ids && data.tag_ids.length > 4) return {bool: false, status: 400, message: "Invalid tag"}
    if(!(/^\d{4}-\d{2}-\d{2}$/.test(data.date))) return {bool: false, status: 400, message: "Invalid date"}
    if(data.description && data.description.length > 255) return {bool: false, status: 400, message: "Invalid description"}
    try{new Intl.NumberFormat("en", {style: 'currency', currency: data.currency_code})} catch { return {bool: false, status: 400, message: "Invalid currency code"} }
    if(!(["draft", "pending_approval", "ready"].includes(data.status))) return {bool: false, status: 400, message: "Invalid status"}
    if((data.number && data.number.length > 50) || (data.number2 && data.number2.length > 50)) return {bool: false, status: 400, message: "Invalid transaction or reference number"}

    //Validate optional parameters
    if(data.shipping_info && data.shipping_info.length > 100) return {bool: false, status: 400, message: "Invalid shipping info"}
    if(data.title && data.title.length > 255) return {bool: false, status: 400, message: "Invalid title"}
    if(!(data.tax_mode === "inclusive" || data.tax_mode === "exclusive")) return {bool: false, status: 400, message: "Invalid tax mode"}
    if(data.payment_mode && !(["credit", "cash"].includes(data.payment_mode))) return {bool: false, status: 400, message: "Invalid payment mode"}
    if(data.myinvois_action && !(["NORMAL", "VALIDATE", "EXTERNAL"].includes(data.myinvois_action))) return {bool: false, status: 400, message: "Invalid invoice action"}

    //Return filtered parameters
    return {bool: true, data}
}

//Verify request for searching sales entry
function verifyGetRequest(rawParams, type){
    //Validate route
    if(!["quotes", "orders", "delivery_orders", "invoices", "credit_notes", "payments", "refunds"].includes(type)){
        return {bool: false, status: 404, message: "Invalid request"}
    }
    //Define the general parameters
    const generalWhitelist = [
        "search", "custom_search", "contact_id",
        "date_from", "date_to",
        "page", "page_size", "sort_by", "sort_dir"
    ];
    //Define the type specific parameters
    const typeSpecificWhitelist = {
        quotes:         [...generalWhitelist, "status", "transfer_status"],
        orders:         [...generalWhitelist, "status", "transfer_status"],
        delivery_orders:[...generalWhitelist, "status", "transfer_status"],
        invoices:       [...generalWhitelist, "status", "payment_status", "email_status", "payment_mode"],
        credit_notes:   [...generalWhitelist, "status", "email_status"],
        payments:       [...generalWhitelist, "status", "email_status"],
        refunds:        [...generalWhitelist, "status", "email_status"]
    };
    //Filter only valid parameters
    let params = Object.fromEntries(
        Object.entries(rawParams).filter(([param]) => typeSpecificWhitelist[type].includes(param))
    );

    //Validate general parameters
    if(params.search && params.search.length > 100) return {bool: false, status: 400, message: "Invalid search length"}
    if(params.custom_search && params.custom_search.length > 100) return {bool: false, status: 400, message: "Invalid custom search length"}
    if(!(/^\d{4}-\d{2}-\d{2}$/.test(params.date_from))) return {bool: false, status: 400, message: "Invalid from date"}
    if(!(/^\d{4}-\d{2}-\d{2}$/.test(params.date_to))) return {bool: false, status: 400, message: "Invalid end date"}
    if(params.status && !(["draft", "pending_approval", "ready", "void"].includes(params.status))) return {bool: false, status: 400, message: "Invalid status"}
    if(params.payment_status && !(['paid', 'outstanding'].includes(params.payment_status))) return {bool: false, status: 400, message: "Invalid payment status"}
    if(params.email_status && !(["UNSENT", "PENDING", "SENT", "BOUNCED", "OPENED", "VIEWED"].includes(params.email_status))) return {bool: false, status: 400, message: "Invalid email status"}
    if(page && page < 1) return {bool: false, status: 400, message: "Invalid page"}
    if(params.sort_dir && !(['asc', 'desc'].includes(params.sort_dir))) return {bool: false, status: 400, message: "Invalid payment status"}
    if(params.sort_by && !(["number", "date", "contact_name", "number2", "title", "description", "amount", "balance", "created_at"].includes(params.sort_by))) return {bool: false, status: 400, message: "Invalid sort type"}

    //Validate optional parameters
    if(params.transfer_status && !(["ALL", "NOT_TRANSFERRED", "PARTIAL_TRANSFERRED", "TRANSFERRED"].includes(params.transfer_status))) return {bool: false, status: 400, message: "Invalid transfer status"}
    if(params.payment_mode && !(["credit", "cash"].includes(params.payment_mode))) return {bool: false, status: 400, message: "Invalid payment mode"}

    /*Validate type specific parameters*/
    //Validate quotes, orders and delivery sort parameter
    if(['quotes','orders','delivery_orders'].includes(type) && params.sort_by && params.sort_by === 'balance') return {bool: false, status: 400, message: "Invalid sort type"}
    //Validate payments sort parameters
    if(type === 'payments' && params.sort_by && params.sort_by === 'title') return {bool: false, status: 400, message: "Invalid sort type"}
    //Validate refunds sort parameters
    if(type === 'refunds' && params.sort_by && !(["amount", "balance"].includes(params.sort_by))) return {bool: false, status: 400, message: "Invalid sort type"}
    //Return filtered parameters
    return {bool: true, params}
}

//Verify request for replacing sales entry
function verifyUpdateRequest(rawData, type){
    //Validate route
    if(!["quotes", "orders", "delivery_orders", "invoices", "credit_notes", "payments", "refunds"].includes(type)){
        return {bool: false, status: 404, message: "Invalid request"}
    }

    //Define the general parameters
    const generalWhitelist = [
        "transactionId", "contact_id", "number", "number2", "date",
        "currency_code", "exchange_rate", "tag_ids", "description",
        "remarks", "title", "billing_party", "show_shipping",
        "shipping_party", "shipping_info", "email", "files"
    ];
    //Define the parameters for each type
    const typeSpecificWhitelist = {
        quotes:         [...generalWhitelist, "tax_mode", "form_items", "term_id"],
        orders:         [...generalWhitelist, "tax_mode", "form_items", "term_id"],
        delivery_orders:[...generalWhitelist, "tax_mode", "form_items"],
        invoices:       [...generalWhitelist, "tax_mode", "form_items", "customs_form_no", "customs_k2_form_no", "incoterms", "myinvois_action", "term_items", "deposit_items"],
        credit_notes:   [...generalWhitelist, "tax_mode", "form_items", "customs_form_no", "customs_k2_form_no", "incoterms", "myinvois_action", "link_items"],
        payments:       [...generalWhitelist, "amount", "link_items", "deposit_items"],
        refunds:        [...generalWhitelist, "link_items", "deposit_items"],
    };
    //Get only valid parameters
    let data = Object.fromEntries(
        Object.entries(rawData).filter(([param]) => typeSpecificWhitelist[type].includes(param))
    );

    //Define general required parameters
    const generalRequired = [
        "transactionId", "contact_id", "number",
        "date", "currency_code", "exchange_rate"
    ]
    //Define type specific required parameters
    const typeSpecificRequired = {
        quotes:         [...generalRequired, "tax_mode", "form_items"],
        orders:         [...generalRequired, "tax_mode", "form_items"],
        delivery_orders:[...generalRequired, "tax_mode", "form_items"],
        invoices:       [...generalRequired],
        credit_notes:   [...generalRequired],
        payments:       [...generalRequired, "deposit_items", "amount"],
        refunds:        [...generalRequired, "deposit_items"],
    }   
    //Check for required parameters
    const provided = Object.keys(data);
    const missing = typeSpecificRequired[type].filter(param => !provided.includes(param));
    //Return missing parameter(s) message
    if (missing.length > 0) return { bool: false, status: 400, message: `Missing required parameter(s): ${missing.join(", ")}`}

    //Validate required parameters
    if(!(/^\d{4}-\d{2}-\d{2}$/.test(data.date))) return {bool: false, status: 400, message: "Invalid date"}
    if(!(["draft", "pending_approval", "ready"].includes(data.status))) return {bool: false, status: 400, message: "Invalid status"}
    try{new Intl.NumberFormat("en", {style: 'currency', currency: data.currency_code})} catch { return {bool: false, status: 400, message: "Invalid currency code"} }
    if(data.number.length > 50 || (data.number2 && data.number2.length > 50)) return {bool: false, status: 400, message: "Invalid transaction or reference number"}

    //Validate optional parameters
    if(data.tag_ids && data.tag_ids.length > 4) return {bool: false, status: 400, message: "Invalid tag"}
    if(data.description && data.description.length > 255) return {bool: false, status: 400, message: "Invalid description"}
    if(data.shipping_info && data.shipping_info.length > 100) return {bool: false, status: 400, message: "Invalid shipping info"}
    if(data.title && data.title.length > 255) return {bool: false, status: 400, message: "Invalid title"}
    if(data.tax_mode && !(data.tax_mode === "inclusive" || data.tax_mode === "exclusive")) return {bool: false, status: 400, message: "Invalid tax mode"}
    if(data.myinvois_action && !(["NORMAL", "VALIDATE", "EXTERNAL"].includes(data.myinvois_action))) return {bool: false, status: 400, message: "Invalid invoice action"}

    //Return filtered parameters
    return {bool: true, data}
}

//Verify request for updating sales status
function verifyPatchRequest(rawData, currentStatus){
    //Define parameters
    const whitelist = [
        "transactionId", "status", "void_reason"
    ];
    //Get only valid parameters
    let data = Object.fromEntries(
        Object.entries(rawData).filter(([param]) => whitelist.includes(param))
    )
    //Define allowed status transition
    const allowedUpdate = {
        draft: ["pending_approval", "ready"],
        pending_approval: ["ready"],
        ready: ["void"],
        void: ["ready"]
    }
    //Check if the update path is allowed
    if (!allowedUpdate[currentStatus].includes(data.status)) {
        return {bool: false, status: 400, message: 'Update not allowed'}
    }

    //Check for reason when voiding transaction
    if (data.status == 'void' && !data.void_reason) {
        return {bool: false, status: 400, message: 'Voiding transaction without reason'}
    }

    //Return the filtered parameters
    return {bool: true, data}
}

module.exports = {
    createSales,
    getSalesList,
    getSales,
    updateSales,
    patchSales,
    deleteSales
}