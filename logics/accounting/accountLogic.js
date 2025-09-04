const axios = require('axios')
const accessToken = process.env.BUKKU_ACCESS_TOKEN
const subdomain = process.env.SUBDOMAIN
const url = process.env.BUKKU_API_URL

const api = axios.create({
  baseURL: `${url}`,
  headers: {
    "Authorization": `Bearer ${accessToken}`,
    "Company-Subdomain": subdomain,
    "Accept": "application/json"
  }
});

const getAccountList = async(req, res) => {
    try {
        const {
            search,
            type,
            is_archived,
            sort_by,
            sort_dir,
        } = req.query;

        const allowedSearch = ["No.", "Reference No.", "Title", "Remarks", "Description", "Contact Name", "Billing Party", "Shipping Party"]
        const allowedType = ["assets", "liabilities", "equity", "income", "expenses"];
        const allowedSortBy = ["code", "name", "balance"];
        const allowedSortDir = ["asc", "desc"];

        const params = {};

        if (search && allowedSearch.includes(search) && search.length <= 100) params.search = search;
        if (type && allowedType.includes(type)) params.type = type;
        if (typeof is_archived === "boolean") params.is_archived = is_archived
        if (sort_by && allowedSortBy.includes(sort_by)) params.sort_by = sort_by;
        if (sort_dir && allowedSortDir.includes(sort_dir)) params.sort_dir = sort_dir;

        const accountInfo = await api.get('/accounts', { params });
        res.json(accountInfo.data);

    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch account" });
    }
}

const getAccount = async(req, res) => {
    try {
        const {id} = req.params
        const response = await api.get(`/accounts/${id}`)
        res.json(response.data)
    } catch (err){
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to fetch account" });
    }
}

const createAccount = async(req, res) => {
    const {
        name,
        type,
        system_type,
        parent_id,
        classification,
        code,
        description
    } = req.body

    if ( !name || !type ) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    if (name && name.length <= 255) return res.status(400).json({ message: `name must be below 255 characters`})
    const allowedType = ["current_assets", "non_current_assets", "other_assets", 
        "current_liabilities", "non_current_liabilities", "equity", "income", 
        "other_income", "cost_of_sales", "expenses", "taxation"
    ];
    if (!allowedType.includes(type)) {
        return res.status(400).json({ message: `Invalid type. Allowed: ${allowedType.join(", ")}` });
    }

    try {
        const allowedSystem = ["bank_cash", "accounts_receivable", "accounts_payable",
             "inventory", "credit_card", "fixed_assets", "depreciation", "my_epf_expense",
             "my_socso_expense", "my_eis_expense", "my_salary_expense"
        ]
        const allowedClass = ["OPERATING", "INVESTING", "FINANCING"]
        const payload = {
            name,
            type
        };

        if (system_type && allowedSystem.includes(system_type)) payload.system_type = system_type
        if (typeof parent_id === "number") payload.parent_id = parent_id
        if (classification && allowedClass.includes(classification)) payload.classification = classification
        if (code && code.length <= 12) payload.code = code
        if (description) payload.description = description;
    
        const response = await api.post('/accounts', payload)
        res.status(201).json(response.data)
    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to create account" });
    }
}

const updateAccount = async(req, res) => {
    if (!req?.body?.id) return res.status(400).json({ 'message': 'ID is required.'});
    try {
        await api.get(`/accounts/${req.body.id}`);

        const allowedType = ["current_assets", "non_current_assets", "other_assets", 
            "current_liabilities", "non_current_liabilities", "equity", "income", 
            "other_income", "cost_of_sales", "expenses", "taxation"
        ];
        const allowedSystem = ["bank_cash", "accounts_receivable", "accounts_payable",
             "inventory", "credit_card", "fixed_assets", "depreciation", "my_epf_expense",
             "my_socso_expense", "my_eis_expense", "my_salary_expense"
        ]
        const allowedClass = ["OPERATING", "INVESTING", "FINANCING"]
        const payload = {};

        if (req.body.name && req.body.name <= 255) payload.name = req.body.name
        if (req.body.type) {
            if (!allowedType.includes(req.body.type)){
                return res.status(400).json({message: "Invalid type"})
            }
            payload.type = req.body.type
        }
        if (req.body.system_type) {
            if (!allowedSystem.includes(req.body.system_type)){
                return res.status(400).json({message: "Invalid system"})
            }
            payload.system_type = req.body.system_type
        }
        if (typeof req.body.parent_id === "number") payload.parent_id = req.body.parent_id
        if (req.body.classification) {
            if (!allowedClass.includes(req.body.classification)){
                return res.status(400).json({message: "Invalid classification"})
            }
            payload.classification = req.body.classification
        }
        if (req.body.code && req.body.code <= 12) payload.code = req.body.code
        if (req.body.description) payload.description = req.body.description

        const result = await api.put(`/accounts/${req.body.id}`, payload);
        res.json(result.data);
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ "message": `No account matches ID ${req.body.id}` });
        }
        console.error('❌ Failed:', err.response?.data || err.message || err);
        res.status(500).json({ error: "Failed to update account" });
    }
}

module.exports = {
    getAccountList,
    getAccount,
    createAccount,
    updateAccount
}