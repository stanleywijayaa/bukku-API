const api = `${process.env.BUKKU_API_URL}sales/quotes`;
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

//Create a sales quotation
const createQuotation = async (req,res) => {
    const data = req.body
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

    try {
        const response = await axios.post(api, data, option)
        res.status(response.status).json(response.data)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: error})
    }
}

//List all quotation
const getQuotationList = async (req,res) => {
    const allowedParams = [
        "search", "custom_search", "contact_id",
        "date_from", "date_to", "status",
        "email_status", "transfer_status",
        "page", "page_size", "sort_by", "sort_dir"
    ];

    // Only keep allowed params
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
            params.page = page
            const response = await axios.get(api, {
                ...option,
                params
            })
            const result = response.data
            data.push(...result.transactions)
            totalPage = Math.ceil(result.paging.total / result.paging.per_page)
            page++
        }
        while(page <= totalPage)
        res.status(200).json({ data })
    }
    catch (error){
        console.error(error)
        return res.status(500).json({message: error})
    }
}

//Get a specific quotation
const getQuotation = async (req,res) => {
    //Get the transaction id
    const id = req.query?.id
    //Check if the id exists
    if (!id) return res.status(400).json({message: 'ID is required'})
    
    try{
        const response = await axios.get(`${api}/${id}`, option)
        const data = response.data
        res.status(response.status).json({data})
    }
    catch (error){
        console.error(error)
        return res.status(500).json({message: error})
    }
}

module.exports = {
    createQuotation,
    getQuotationList,
    getQuotation
}