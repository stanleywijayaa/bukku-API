const api = "https://api.bukku.fyi/v2/lists";
const axios = require("axios");
const dotenv = require('dotenv');
dotenv.config();

const allowedTypes = [
    "countries", "currencies", "contacts", "contact_addresses", "company_addresses",
    "contact_groups", "classification_code_list", "products", "product_list", "product",
    "product_groups", "accounts", "terms", "payment_methods", "price_levels", "tag_groups", 
    "asset_types", "fields", "numberings", "form_designs", "locations", "stock_balances",
    "tax_codes", "settings", "limits", "users", "advisors", "state_list"]

const getLists = async (req, res) => {
  const { lists } = req.body;
  if (!lists) {
    return res.status(400).json({ message: "Lists is required" });
  }
  
  if (!allowedTypes.includes(lists)) {
    return res.status(400).json({
      message: `Invalid list type. Allowed types are: ${allowedTypes.join(", ")}`
    });
  }

  const bukkuPayload = {
    filter: { type: lists },
  };

  try {
    const response = await axios.post(api, bukkuPayload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BUKKU_ACCESS_TOKEN}`,
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({message: "failed to fetch lists", error: err.response?.data || err.message || err});
  }
};

module.exports = {
    getLists,
}
