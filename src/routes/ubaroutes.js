const express = require('express');
const services = require('../services/services');

const ubaroutes = express.Router();

ubaroutes.post('/login', async (req, res) => {
    let { userid, password} = req.body;
    let response = await services.loginToUBA(userid, password);
    res.send(response);
});

ubaroutes.post('/transactions', async (req, res) => {
    let { userid, password, startdate, enddate} = req.body;
    let response = await services.spoolUBATransactions(userid, password, startdate, enddate);
    res.send(response);
});

module.exports = ubaroutes;