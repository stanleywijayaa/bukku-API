const baseURL = `${process.env.BUKKU_API_URL}sales/`;
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();
const apiToken = process.env.BUKKU_ACCESS_TOKEN
const option = {
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        Authorization: `bearer ${apiToken}`,
        'Company-Subdomain': process.env.SUBDOMAIN
    }
}

//Create a sales
const createSales = async (req,res) => {
    //Determine the sales type
    const { type } = req.params
    const api = `${baseURL}${type}`
    //Get the parameters
    const data = req.body
    //Check for required parameters
    if (type == 'refunds') {
        if(!data?.contact_id ||
            !data?.date ||
            !data?.currency_code ||
            !data?.exchange_rate ||
            !data?.deposit_items ||
            !data?.status
        ){
            return res.status(400).json({message: 'Missing required parameters'})
        }
    }
    else if (type == 'payments'){
        if(!data?.contact_id ||
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
    else{
        if(!data?.contact_id ||
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
        //Create the sales entry
        const response = await axios.post(api, data, option)
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
    const api = `${baseURL}${type}`
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
            const response = await axios.get(api, {
                ...option,
                params
            })
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
    const api = `${baseURL}${type}`
    //Get the transaction id
    const id = req.query?.id
    //Check if the id exists
    if (!id) return res.status(400).json({message: 'ID is required'})
    
    try{
        //Get the sales
        const response = await axios.get(`${api}/${id}`, option)
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
    const api = `${baseURL}${type}`
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
        const response = await axios.put(`${api}/${id}`, payload, option)
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
    const api = `${baseURL}${type}`
    //Get the transaction id
    const id = req.query?.id
    //Get the transaction status and reason if void
    const param = req.body
    //Check if the id and status exists
    if (!id) return res.status(400).json({message: 'ID is required'})
    if (!param?.status) return res.status(400).json({message: 'Status is required'})
    
    try{
        //Check if the transaction exists
        const transaction = await axios.get(`${api}/${id}`, option)
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
        const response = await axios.patch(`${api}/${id}`, param, option)
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
        const transaction = await axios.get(`${api}/${id}`, option)
        if (transaction.status != 'void' || transaction.status != 'draft'){
            return res.status(400).json({message: "Unable to delete transaction with status other than void or draft"})
        }
        //Delete the sales
        const response = await axios.delete(`${api}/${id}`, option)
        //Return the sales
        res.status(response.status).json({data: true})
    }
    catch (error){
        console.error(error)
        return res.status(500).json({message: `Failed deleting ${type}`, error})
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