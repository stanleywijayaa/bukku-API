const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

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
    //Allowed parameters
    const allowedParams = [
        "search", "custom_search", "contact_id",
        "date_from", "date_to", "status",
        "email_status", "transfer_status",
        "page", "page_size", "sort_by", "sort_dir"
    ];

    //Filter invalid parameters
    let params = Object.keys(req.query)
    .filter(key => allowedParams.includes(key))
    .reduce((obj, key) => {
        obj[key] = req.query[key];
        return obj;
    }, {});

    try{
        let page = 1
        let totalPage = 1
        let data = []
        do {
            //Update page
            params.page = page
            //Get the data
            const response = await api.get(type, { params })
            const result = response.data
            data.push(...result.transactions)
            //Get the total number of page
            totalPage = Math.ceil(result.paging.total / result.paging.per_page)
            //Iterate page
            page++
        }
        //Get all the data
        while(page <= totalPage)
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
        if(!(new Intl.NumberFormat("en", {style: 'currency', currency: data.currency_code}))) return {bool: false, status: 400, message: "Invalid currency code"}
        if(!(["draft", "pending_approval", "ready"].includes(data.status))) return {bool: false, status: 400, message: "Invalid status"}
        if((data.number || data.number2) && (data.number.length > 50 || data.number2.length > 50)) return {bool: false, status: 400, message: "Invalid transaction or reference number"}
    }

    //Check for type-specific parameters
    if (["quotes", "orders", "delivery_orders", "invoice", "credit_notes"].includes(type)){
        //Check required parameter for (quotes, orders, delivery orders, invoice, and credit notes)
        if(!data.tax_mode || !data.form_items){
            return {bool: false, status: 400, message: "Missing required parameter(s)"}
        }
        //Validate parameters for (quotes, orders, delivery orders, invoice, and credit notes)
        else{
            if(data.shipping_info && data.shipping_info.length > 100) return {bool: false, status: 400, message: "Invalid shipping info"}
            if(data.title && data.title.length > 255) return {bool: false, status: 400, message: "Invalid title"}
            if(!(data.tax_mode === "inclusive" || data.tax_mode === "exclusive")) return {bool: false, status: 400, message: "Invalid tax mode"}
            return {bool: true}
        }
    }
    else if (type === 'payments'){
        //Check required parameter for payments
        if(!data.amount || !data.deposit_items) return {bool: false, status: 400, message: "Missing required parameter(s)"}
        return {bool: true}
    }
    else if (type === 'refunds'){
        //Check required parameter for refunds
        if(!data?.deposit_items) return {bool: false, status: 400, message: "Missing required parameter(s)"}
        return {bool: true}
    }
    else {
        return {bool: false, status: 404, message: "Invalid request"}
    }
}

function verifyGetRequest(body,type){
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