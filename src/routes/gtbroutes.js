const express = require('express');
const services = require('../services/services');

const gtbroutes = express.Router();

gtbroutes.post('/login', async (req, res) => {
    let { userid, password} = req.body;
    let response = await services.loginToGTB(userid, password);
    res.send(response);
});

gtbroutes.post('/transactions', async (req, res) => {
    let { userid, password, startdate, enddate } = req.body;
    let response = await services.spoolGTBTransactions(userid, password, startdate, enddate);
    res.send(response);    
});

module.exports = gtbroutes;