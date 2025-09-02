const api = `${process.env.BUKKU_API_URL}sales/quotes`;
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();
const apiToken = process.env.BUKKU_ACCESS_TOKEN

const getQuotationList = async (req,res) => {
    try{
        const page = 1
        const totalPage = 1
        let data = []
        do {
            const response = await axios.get(api, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `bearer ${apiToken}`,
                    'Company-Subdomain': process.env.SUBDOMAIN
                }
            })
            const result = response.data
            data.push(...result.transactions)
            totalPage = result.paging.total
            page ++
        }
        while(totalPage <= page)
        res.status(200).json({data})
    }
    catch (error){
        console.error(error)
        res.status(500).json({message: error})
    }
}

const createQuotation = async (req,res) => {
    const query = req.body
    if(!query?.contact_id ||
        !query?.date ||
        !query?.currency_code ||
        !query?.exchange_rate ||
        !query?.tax_mode ||
        !query?.form_items ||
        !query?.status
    ){
        return res.status(400).json({message: 'Missing required parameters'})
    }

    try {
        const response = await axios.post(api, query, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                Authorization: `bearer ${apiToken}`,
                'Company-Subdomain': process.env.SUBDOMAIN
            }
        })
        res.status(response.status).json(response.data)
    } catch (error) {
        console.log(error)
        return res.status(500).json({message: error})
    }
}

module.exports = {
    getQuotationList,
    createQuotation,
}