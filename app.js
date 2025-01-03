if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const errorHandler = require('./utils/errorHandler');
const router = require('./routes/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else if (process.env.NODE_ENV === 'production') {
    app.use(morgan('common'));
}

app.use(express.json());
app.use(router);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = { server };
