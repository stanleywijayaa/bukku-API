const express = require('express');
const path = require('path');
const cors = require('cors')
const cookieParser = require('cookie-parser');
require('dotenv').config()
const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use('/purchases', require('./routes/purchaseRoute'))

//Sales route
app.use('/sales', require('./routes/salesRoute'))

app.listen(PORT, () => {console.log(`Server is running on port ${PORT}`);});