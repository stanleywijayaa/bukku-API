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
    const {valid, params} = verifyGetRequest(rawParams, type)
    if (!valid.bool){
        return res.status(valid.status).json({message: valid.message})
    }

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
    //Get the parameters
    const data = req.body
    //Check for required parameters
    if (type == 'refunds') {
        if(!data?.transactionId ||
            !data?.contact_id ||
            !data?.number ||
            !data?.date ||
            !data?.currency_code ||
            !data?.exchange_rate ||
            !data?.deposit_items
        ){
            return res.status(400).json({message: 'Missing required parameters'})
        }
    }
    else if (type == 'payments'){
        if(!data?.transactionId ||
            !data?.contact_id ||
            !data?.number ||
            !data?.date ||
            !data?.currency_code ||
            !data?.exchange_rate ||
            !data?.amount ||
            !data?.deposit_items
        ){
            return res.status(400).json({message: 'Missing required parameters'})
        }
    }
    else{
        if(!data?.transactionId ||
            !data?.contact_id ||
            !data?.date ||
            !data?.currency_code ||
            !data?.exchange_rate ||
            !data?.tax_mode ||
            !data?.form_items ||
            !data?.status
        ){
            return res.status(400).json({message: 'Missing required parameters'})
        }
    }

    try {
        const { id, ...payload } = data
        //Replace the sales entry
        const response = await api.put(`${type}/${id}`, payload)
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

        //Define the allowed paths
        const allowedUpdate = {
            draft: ["pending_approval", "ready"],
            pending_approval: ["ready"],
            ready: ["void"],
            void: ["ready"]
        }
        
        //Check if the update path is allowed
        if(!allowedUpdate[currentStatus].includes(param.status)){
            return res.status(400).json({message: 'Update not allowed'})
        }

        //Check for reason when voiding transaction
        if(param.status == 'void' && !param.void_reason){
            return res.status(400).json({message: 'Voiding transaction without reason'})
        }

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
function verifyCreateRequest(data, type){
    //Check for required general parameters
    if(!data.contact_id ||
        !data.date ||
        !data.currency_code ||
        !data.exchange_rate ||
        !data.status)
    {
        return {bool: false, status: 400, message: "Missing required parameter(s)"}
    }
    //Validate general parameters
    else{
        if(data.tag_ids && data.tag_ids.length > 4) return {bool: false, status: 400, message: "Invalid tag"}
        if(!(/^\d{4}-\d{2}-\d{2}$/.test(data.date))) return {bool: false, status: 400, message: "Invalid date"}
        if(data.description && data.description.length > 255) return {bool: false, status: 400, message: "Invalid description"}
        try{new Intl.NumberFormat("en", {style: 'currency', currency: data.currency_code})} catch { return {bool: false, status: 400, message: "Invalid currency code"} }
        if(!(["draft", "pending_approval", "ready"].includes(data.status))) return {bool: false, status: 400, message: "Invalid status"}
        if((data.number && data.number.length > 50) || (data.number2 && data.number2.length > 50)) return {bool: false, status: 400, message: "Invalid transaction or reference number"}
    }

    //Check for type-specific parameters
    if (["quotes", "orders", "delivery_orders", "invoices", "credit_notes"].includes(type)){
        //Check required parameter for (quotes, orders, delivery orders, invoice, and credit notes)
        if(!data.tax_mode || !data.form_items){
            return {bool: false, status: 400, message: "Missing required parameter(s)"}
        }
        //Validate parameters for (quotes, orders, delivery orders, invoice, and credit notes)
        else{
            if(data.shipping_info && data.shipping_info.length > 100) return {bool: false, status: 400, message: "Invalid shipping info"}
            if(data.title && data.title.length > 255) return {bool: false, status: 400, message: "Invalid title"}
            if(!(data.tax_mode === "inclusive" || data.tax_mode === "exclusive")) return {bool: false, status: 400, message: "Invalid tax mode"}
            if(type === 'invoices'){
                if(!data.payment_mode ||
                    (data.payment_mode === 'credit' && !data.term_items) ||
                    (data.payment_mode === 'cash' && !data.deposit_items)
                ) return {bool: false, status: 400, message: "Missing required parameter(s)"}
                if(data.myinvois_action && !(["NORMAL", "VALIDATE", "EXTERNAL"].includes(data.myinvois_action))) return {bool: false, status: 400, message: "Invalid invoice action"}
            }
            if(type === 'credit_notes'){
                if(data.myinvois_action && !(["NORMAL", "VALIDATE", "EXTERNAL"].includes(data.myinvois_action))) return {bool: false, status: 400, message: "Invalid invoice action"}
            }
            return {bool: true}
        }
    }
    //Check required parameter for payments
    else if (type === 'payments'){
        if(!data.amount || !data.deposit_items) return {bool: false, status: 400, message: "Missing required parameter(s)"}
        if(params.payment_mode && !(["credit", "cash"].includes(params.payment_mode))) return {bool: false, status: 400, message: "Invalid payment mode"}
        return {bool: true}
    }
    //Check required parameter for refunds
    else if (type === 'refunds'){
        if(!data?.deposit_items) return {bool: false, status: 400, message: "Missing required parameter(s)"}
        return {bool: true}
    }
    //Handle invalid route
    else {
        return {bool: false, status: 404, message: "Invalid request"}
    }
}

//Verify request for searching sales entry
function verifyGetRequest(rawParams, type){
    //Set the allowed filter parameters
    const allowedParams = [
        "search", "custom_search", "contact_id",
        "date_from", "date_to", "status", "payment_status",
        "email_status", "transfer_status", "payment_mode",
        "page", "page_size", "sort_by", "sort_dir", "account_id"
    ];
    //Get all valid query parameters
    let params = Object.keys(rawParams)
    .filter(key => allowedParams.includes(key))
    .reduce((obj, key) => {
        obj[key] = rawParams[key];
        return obj;
    }, {});
    
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

    //##Validate type-specific parameters##
    //Validate quotes, orders and delivery orders request
    if (type === 'quotes' || type === 'orders' || type === 'delivery_orders'){
        //Validate parameters
        if(params.transfer_status && !(["ALL", "NOT_TRANSFERRED", "PARTIAL_TRANSFERRED", "TRANSFERRED"].includes(params.transfer_status))) return {bool: false, status: 400, message: "Invalid transfer status"}
        if(params.sort_by && params.sort_by === 'balance') return {bool: false, status: 400, message: "Invalid sort type"}
        //Filter invalid parameters
        const filteredParams = params.filter(param => !['payment_status', 'payment_mode', 'account_id'].includes(param))
        return {bool: true, params: filteredParams}
    }
    //Validate invoice request
    else if (type === 'invoices'){
        //Validate parameters
        if(params.payment_mode && !(["credit", "cash"].includes(params.payment_mode))) return {bool: false, status: 400, message: "Invalid payment mode"}
        //Filter invalid parameters
        const filteredParams = params.filter(param => !['transfer_status', 'account_id'].includes(param))
        return {bool: true, params: filteredParams}
    }
    //Validate credit notes request
    else if (type === 'credit_notes'){
        //Filter invalid parameters
        const filteredParams = params.filter(param => !['transfer_status', 'payment_mode', 'account_id'].includes(param))
        return {bool: true, params: filteredParams}
    }
    //Validate payments requests
    else if (type === 'payments'){
        //Validate parameters
        if(params.sort_by && params.sort_by === 'title') return {bool: false, status: 400, message: "Invalid sort type"}
        //Filter invalid parameters
        const filteredParams = params.filter(param => !['transfer_status', 'payment_mode'].includes(param))
        return {bool: true, params: filteredParams}
    }
    else if (type === 'refunds'){
        //Validate parameters
        if(params.sort_by && !(["amount", "balance"].includes(params.sort_by))) return {bool: false, status: 400, message: "Invalid sort type"}
        //Filter invalid parameters
        const filteredParams = params.filter(param => !['transfer_status', 'payment_mode'].includes(param))
        return {bool: true, params: filteredParams}
    }
    //Handle invalid requests
    else {
        return {bool: false, status: 404, message: "Invalid request"}
    }
}

//Verify request for replacing sales entry
function verifyUpdateRequest(body,type){
    if (type === 'quotes' || type === 'orders' || type === 'delivery_orders' || type === 'invoice' || type === 'credit_notes'){
        
    }
    else if (type === 'payments'){

    }
    else if (type === 'refunds'){

    }
    else {
        return null
    }
}

function verifyPatchRequest(body,type){
    if (type === 'quotes' || type === 'orders' || type === 'delivery_orders' || type === 'invoice' || type === 'credit_notes'){
        
    }
    else if (type === 'payments'){

    }
    else if (type === 'refunds'){

    }
    else {
        return null
    }
}

module.exports = {
    createSales,
    getSalesList,
    getSales,
    updateSales,
    patchSales,
    deleteSales
}