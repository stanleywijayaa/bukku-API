const axios = require('axios')
const accessToken = process.env.BUKKU_ACCESS_TOKEN
const subdomain = process.env.SUBDOMAIN
const url = process.env.BUKKU_API_URL

const api = axios.create({
  baseURL: `${url}/purchases`,
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Company-Subdomain": subdomain,
    "Accept": "application/json"
  }
});

module.exports = api;