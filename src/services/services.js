const encryptors = require('../core/encryptors');
const datastorers = require('../core/datastorers');
const constants = require('../core/constants');
const HttpsProxyAgent = require("https-proxy-agent");
var querystring = require('querystring');
var CryptoJS = require('crypto-js');
const filesystem = require('fs');
const Scraper = require('../core/scrapers');
const axiosstorage = require('axios-storage');
var htmlDecode = require('decode-html');
var htmlEncode = require('encode-html');
//const postman = require('axios').default;

const httpsProxyAgent = new HttpsProxyAgent({ host: "154.113.32.17", port: "8080" });
//const httpsAgent = new HttpsProxyAgent({host: "proxyhost", port: "proxyport", auth: "username:password"});


let responsePayload = {
    responseCode: "",
    responseMessage: "",
    data: {}
}

// set global config
axiosstorage.config({
    storagePrefix: 'ubastorage',
    storageMode: 'sessionStorage',
    maxAge: 120 * 60 * 1000
});
function createGTBPostman() {
    let axios = require('axios');
    axios = axios.create(
        {
            withCredentials: true,
            adapter: axiosstorage.adapter,
            //httpsAgent: httpsProxyAgent
        }
    );
    return axios;
}
function createUBAPostman() {
    let axios = require('axios');
    axios = axios.create(
        {
            withCredentials: true,
            adapter: axiosstorage.adapter,
            //httpsAgent: httpsProxyAgent
        }
    );
    return axios;
}

let ubaJar = {
    Cookies: undefined
};
let FEBAObjects = {};

async function gtbLogin(userid, password) {
    console.log("GTB Mobile App Login");
    try {
        const gtbPostman = createGTBPostman();
        responsePayload.data = {};
        datastorers.resetGTBStore(); /* clear local storage for every login */
        if (!userid || !password) {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Please provide a valid userid and password.";
            responsePayload.data = {};
            return responsePayload;
        }
        const form = {
            data: {
                Uuid: datastorers.retrieveAllGTBData().Uuid, /*use the random default if not set previously */
                Platform: "Android", /*Random value*/
                Model: "SM-G977N", /*Random value*/
                Manufacturer: "samsung", /*Random value*/
                DeviceToken: "",
                UserId: userid,
                UserName: undefined,
                OtherParams: undefined,
                IsGAPSLite: 0,
                Channel: constants.GTB.CHANNEL,
                AppVersion: constants.GTB.APPVERSION
            },
            OtherParamsUnEncrypted: {
                UserId: userid,
                Password: password
            },
        };

        form.data.OtherParams = encryptors.encryptGTBData(JSON.stringify(form.OtherParamsUnEncrypted));

        let res = await gtbPostman.post(constants.GTB.URLS.NGBASEURL, form.data);

        let data = JSON.parse(res.data);

        if (data.StatusCode != 0) {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = data.Message;
            return responsePayload;
        }

        let message = JSON.parse(data.Message);

        switch (message.CODE) {
            case "2000":
            case "2001":
            case "2002":
                datastorers.saveOneGTBData("SourceAccount", encryptors.encryptGTBData(userid));
                datastorers.saveOneGTBData("AuthToken", encryptors.encryptGTBData(data.AuthToken));
                datastorers.saveOneGTBData("UserId", message.USERID);
                datastorers.saveOneGTBData("Udid", message.DEVICE_UID);
                datastorers.saveOneGTBData("loggedinUserId", userid);

                responsePayload.responseCode = constants.responseCodes.SUCCESS;
                responsePayload.responseMessage = message.STATUSMESSAGE;
                break;
            default:
                responsePayload.responseCode = constants.responseCodes.FAILED;
                responsePayload.responseMessage = "System cannot determine Login status. Kindly try again later.";
                break;
        }
        return responsePayload;

    }
    catch (e) {
        console.log(e);
        responsePayload.responseCode = constants.responseCodes.FAILED;
        responsePayload.responseMessage = "System cannot determine Login status. Kindly try again later.";
        return responsePayload;
    }
}

async function gtbTransactions(userid, password, startdate, enddate) {
    console.log("GTB Mobile App Transactions Retrieval");
    try {

        const gtbPostman = createGTBPostman();
        responsePayload.data = {};
        if (!userid || !password || !startdate || !enddate) {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Please provide valid details for userid, password, startdate(dd/MM/yyyy), enddate(dd/MM/yyyy).";
            return responsePayload;
        }

        //Login if the user has not logged in previously before proceeding
        if (!datastorers.retrieveOneGTBData("AuthToken") || !datastorers.retrieveOneGTBData("SourceAccount") || !datastorers.retrieveOneGTBData("UserId")) {
            let loginresp = await gtbLogin(userid, password);
            if (loginresp.responseCode != constants.responseCodes.SUCCESS) {
                return loginresp;
            };
        }

        //Relogin if the last logged in user is different from this user's transaction details request.
        if (datastorers.retrieveOneGTBData("loggedinUserId") != userid) {
            console.log("A different user logged in previously. A re-login will be done")
            let loginresp = gtbLogin(userid, password);
            console.log(loginresp)
            if (loginresp.responseCode != constants.responseCodes.SUCCESS) {
                return loginresp;
            };
        }

        const form = {
            data: {
                UserId: datastorers.retrieveOneGTBData("UserId"),
                SourceAccount: datastorers.retrieveOneGTBData("SourceAccount"),
                FromDate: startdate,
                ToDate: enddate,
                AmountSearch: "",
                BeneNameSearch: "",
                AuthToken: datastorers.retrieveOneGTBData("AuthToken"),
                Udid: datastorers.retrieveOneGTBData("Udid")
            }
        };

        let res = await gtbPostman.post(constants.GTB.URLS.HISTORYURL, form.data);

        let data = JSON.parse(res.data);

        if (data.StatusCode != 0) {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = data.Message;
            return responsePayload;
        }

        let message = JSON.parse(data.Message);

        switch (message.CODE) {
            case "1000":
                responsePayload.responseCode = constants.responseCodes.SUCCESS;
                responsePayload.responseMessage = message.STATUSMESSAGE;
                responsePayload.data = message.TRANSACTIONS.TRANSACTION
                break;
            default:
                responsePayload.responseCode = constants.responseCodes.FAILED;
                responsePayload.responseMessage = "System cannot retrieve transactions at the moment. Kindly try again later.";
                break;
        }
        return responsePayload;

    }
    catch (e) {
        console.log(e);
        responsePayload.responseCode = constants.responseCodes.FAILED;
        responsePayload.responseMessage = "System cannot retrieve transactions at the moment. Kindly try again later.";
        return responsePayload;
    }

}


async function ubaLogin(userid, password) {
    console.log("UBA Internet Banking Login");

    const ubaPostman = createUBAPostman();
    responsePayload.data = {};
    try {
        var monoscraper = new Scraper();
        var xNum = "";
        let loginformobject = {};
        var nextUrl = null;
        let currentView = "";
        /*Initialize the form object with browser-based fingerprinting parameters */
        loginformobject["deviceDNA"] = constants.UBA.BROWSERPARAMS.DEVICEDNA;
        loginformobject["autocomplete-dropdown"] = constants.UBA.BROWSERPARAMS.DRPDWN1;
        loginformobject["autocomplete-dropdown"] = constants.UBA.BROWSERPARAMS.DRPDWN2;
        loginformobject["executionTime"] = constants.UBA.BROWSERPARAMS.EXECTIME;
        loginformobject["desc"] = constants.UBA.BROWSERPARAMS.DESC;
        loginformobject["mesc"] = constants.UBA.BROWSERPARAMS.MESC;
        loginformobject["dnaError"] = constants.UBA.BROWSERPARAMS.DNAERR;
        loginformobject["mescIterationCount"] = constants.UBA.BROWSERPARAMS.MESCITRCOUNT;
        loginformobject["isDNADone"] = constants.UBA.BROWSERPARAMS.ISDNADONE;
        loginformobject["arcotFlashCookie"] = constants.UBA.BROWSERPARAMS.ARCOTFLASHCOOKIE;
        loginformobject["DEVICE_ID"] = constants.UBA.BROWSERPARAMS.DEVICEID;
        loginformobject["DEVICE_TYPE"] = constants.UBA.BROWSERPARAMS.DEVICETYPE;
        loginformobject["MACHINE_FINGER_PRINT"] = constants.UBA.BROWSERPARAMS.MACHINEFINGERPRINT;

        let formobject1 = Object.assign({}, loginformobject);
        let formobject2 = Object.assign({}, loginformobject); /*Form Object for the final login with password */

        nextUrl = constants.UBA.URLS.BASEURL;
        /* Visit the base URL and set device fingerprinting and DNA details et al */
        await ubaPostman.get(nextUrl)
            .then(response => {
                currentView = response.data;
                monoscraper.loadPage(currentView);
            })
            .catch(err => {
                responsePayload.responseCode = constants.responseCodes.FAILED;
                responsePayload.responseMessage = "Error Occurred on visiting Base URL";
                console.log(err)
                return responsePayload;
            });

        xNum = extractUbaToken(monoscraper);
        
        monoscraper.locateGetElement("form input, form select").each(
            function (index) {
                var input = monoscraper.getTransverser()(this);
                formobject1[input.attr('name')] = input.val();
            }
        );
        nextUrl = constants.UBA.URLS.NGBASEURL + monoscraper.locateGetAttribute(constants.UBA.MARKERS.AUTHENTICATIONFORM, 'action');

        /*Attempt to submit userid first */
        formobject1["AuthenticationFG.USER_PRINCIPAL"] = userid;
        await ubaPostman.post(nextUrl,
            querystring.stringify(formobject1),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        ).then(function (response) {
            currentView = response.data;
            monoscraper.loadPage(currentView);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on submitting User Id";
            console.log(err)
            return responsePayload;
        });

        /* Aggregate all available form elements on the login form page */
        monoscraper.locateGetElement("form input, form select").each(
            function (index) {
                var input = monoscraper.getTransverser()(this);
                formobject2[input.attr('name')] = input.val();
            }
        );
        nextUrl = constants.UBA.URLS.NGBASEURL + monoscraper.locateGetAttribute(constants.UBA.MARKERS.AUTHENTICATIONFORM, 'action');

        /* Build the complete encrypted login details */
        let pwd = "password=" + password + "_SALT_COMPONENT_=" + Math.random();
        let dummi1 = "password=" + constants.UBA.BROWSERPARAMS.DUMMY1 + "_SALT_COMPONENT_=" + Math.random();
        let dummi2 = "password=" + constants.UBA.BROWSERPARAMS.DUMMY2 + "_SALT_COMPONENT_=" + Math.random();
        let jskey = formobject2["__JS_ENCRYPT_KEY__"];

        formobject2["dummy1"] = await encryptors.encryptUBAData(dummi1, jskey);
        formobject2["AuthenticationFG.ACCESS_CODE"] = await encryptors.encryptUBAData(pwd, jskey);
        formobject2["dummy2"] = await encryptors.encryptUBAData(dummi2, jskey);
        formobject2['buffer'] = '';
        formobject2.DECRYPT_FLAG = 'Y';
        formobject2.JS_ENABLED_FLAG = 'Y';

        /*Attempt to complete login with encrypted password details */
        await ubaPostman.post(nextUrl,
            querystring.stringify(formobject2),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }
        ).then(function (response) {
            currentView = response.data;
            monoscraper.loadPage(currentView);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on fully encrypted login to UBA portal.";
            console.log(err)
            return responsePayload;
        });

        /* Confirm the login was sucessful */
        await extractFEBAObjects(constants.UBA.MARKERS.RETAILUSERDASHBOARD, monoscraper);
        if (FEBAObjects) {
            responsePayload.responseCode = constants.responseCodes.SUCCESS;
            responsePayload.responseMessage = "Successful Login. ";
            return responsePayload;
        }
        else {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Login attempt failed. UBA Internet Banking Portal is requesting answers to personal security questions for this account. Please wait for some time and try again later. ";
            return responsePayload;
        }

    }
    catch (e) {
        console.log(e);
        responsePayload.responseCode = constants.responseCodes.FAILED;
        responsePayload.responseMessage = "System cannot determine Login status. Kindly try again later.";
        return responsePayload;
    }

}

async function ubaTransactions(userid, password, startdate, enddate) {
    console.log("UBA Internet Banking Transactions Retrieval");

    const ubaPostman = createUBAPostman();
    responsePayload.data = {};
    try {
        var monoscraper = new Scraper();

        var xNum = "";
        var loggedinReqId = 0;
        let loginformobject = {};
        var nextUrl = null;
        var nextReferer = null;
        let currentView = "";
        let accountNumber = undefined;
        let finParam = "";
        let reqIdcookie = "";

        /*Initialize the form object with static browser-based fingerprinting parameters */
        loginformobject["deviceDNA"] = constants.UBA.BROWSERPARAMS.DEVICEDNA;
        loginformobject["autocomplete-dropdown"] = constants.UBA.BROWSERPARAMS.DRPDWN1;
        loginformobject["autocomplete-dropdown"] = constants.UBA.BROWSERPARAMS.DRPDWN2;
        loginformobject["executionTime"] = constants.UBA.BROWSERPARAMS.EXECTIME;
        loginformobject["desc"] = constants.UBA.BROWSERPARAMS.DESC;
        loginformobject["mesc"] = constants.UBA.BROWSERPARAMS.MESC;
        loginformobject["dnaError"] = constants.UBA.BROWSERPARAMS.DNAERR;
        loginformobject["mescIterationCount"] = constants.UBA.BROWSERPARAMS.MESCITRCOUNT;
        loginformobject["isDNADone"] = constants.UBA.BROWSERPARAMS.ISDNADONE;
        loginformobject["arcotFlashCookie"] = constants.UBA.BROWSERPARAMS.ARCOTFLASHCOOKIE;
        loginformobject["DEVICE_ID"] = constants.UBA.BROWSERPARAMS.DEVICEID;
        loginformobject["DEVICE_TYPE"] = constants.UBA.BROWSERPARAMS.DEVICETYPE;
        loginformobject["MACHINE_FINGER_PRINT"] = constants.UBA.BROWSERPARAMS.MACHINEFINGERPRINT;

        let formobject1 = Object.assign({}, loginformobject); /*Form object for the initial userid only login */
        let formobject2 = Object.assign({}, loginformobject); /*Form Object for the final login with password */

        nextUrl = constants.UBA.URLS.BASEURL;
        /* Visit the base URL and set device fingerprinting and DNA details et al */
        await ubaPostman.get(nextUrl
        ).then(response => {
            currentView = response.data;
            monoscraper.loadPage(currentView);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on visiting UBA Internet Banking Portal.";
            console.log(err);
            return responsePayload;
        });

        xNum = extractUbaToken(monoscraper);
        monoscraper.locateGetElement("form input, form select").each(
            function (index) {
                var input = monoscraper.getTransverser()(this);
                formobject1[input.attr('name')] = input.val();
            }
        );
        nextUrl = constants.UBA.URLS.NGBASEURL + monoscraper.locateGetAttribute(constants.UBA.MARKERS.AUTHENTICATIONFORM, 'action');

        /*Attempt to submit userid first */
        formobject1["AuthenticationFG.USER_PRINCIPAL"] = userid;
        await ubaPostman.post(nextUrl,
            querystring.stringify(formobject1),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }
        ).then(function (response) {
            currentView = response.data;

            monoscraper.loadPage(currentView);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on submitting User Id";
            console.log(err)
            return responsePayload;
        });

        /* Aggregate all available form elements on the login form page */
        monoscraper.locateGetElement("form input, form select").each(
            function (index) {
                var input = monoscraper.getTransverser()(this);
                formobject2[input.attr('name')] = input.val();
            }
        );
        nextUrl = constants.UBA.URLS.NGBASEURL + monoscraper.locateGetAttribute(constants.UBA.MARKERS.AUTHENTICATIONFORM, 'action');

        /* Build the complete encrypted login details */
        let pwd = "password=" + password + "_SALT_COMPONENT_=" + Math.random();
        let dummi1 = "password=" + constants.UBA.BROWSERPARAMS.DUMMY1 + "_SALT_COMPONENT_=" + Math.random();
        let dummi2 = "password=" + constants.UBA.BROWSERPARAMS.DUMMY2 + "_SALT_COMPONENT_=" + Math.random();
        let jskey = formobject2["__JS_ENCRYPT_KEY__"];

        /*encrypt required password parameters */
        formobject2["dummy1"] = await encryptors.encryptUBAData(dummi1, jskey);
        formobject2["AuthenticationFG.ACCESS_CODE"] = await encryptors.encryptUBAData(pwd, jskey);
        formobject2["dummy2"] = await encryptors.encryptUBAData(dummi2, jskey);
        formobject2['buffer'] = '';
        formobject2.DECRYPT_FLAG = 'Y';
        formobject2.JS_ENABLED_FLAG = 'Y';

        /*Attempt to complete login with encrypted password details */
        await ubaPostman.post(nextUrl,
            querystring.stringify(formobject2),
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                }
            }
        ).then(function (response) {
            currentView = response.data;
            monoscraper.loadPage(currentView);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on full encrypted login to UBA portal.";
            console.log(err)
            return responsePayload;
        });

        nextReferer = nextUrl; //This is the URl on the browser for next referer.
        reqIdcookie = generateRequestIdCookie_finParam(nextReferer, xNum, undefined);
        saveRequestidCookie('Requestid=' + reqIdcookie + ';Path=/');

        /* Extract next set of useful parameters */
        await extractFEBAObjects(constants.UBA.MARKERS.RETAILUSERDASHBOARD, monoscraper);
        if (FEBAObjects) {
            nextUrl = FEBAObjects.baseUrl;
        }
        else {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "UBA Internet Banking Portal is expecting answers to personal security questions. Please wait some time and try again later. ";
            return responsePayload;
        }

        if (nextUrl == null) {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "System could not extract the Account Summary URL.";
            return responsePayload;
        }

        nextUrl = constants.UBA.URLS.NGBASEURL + nextUrl;

        finParam = generateRequestIdCookie_finParam(nextUrl, xNum, loggedinReqId);

        /* Attempt to load the dashboard account summary snippet via Ajax post request*/
        await ubaPostman.post(nextUrl,
            `criteria={"WID_CONF":"RetailUserDashboardUX5_INWD__1","PARENT_MENU_FOR_REMOVE":"DASHAT","GROUPLETS_IN_PAGE":"%2CRetailUserDashboardUX5_WAC85__1"}&target=RetailUserDashboardUX5_WAC85__1&requestId=${loggedinReqId}`,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    cookie: ubaJar.Cookies,
                    "finParam": finParam,
                    "requestId": loggedinReqId,
                    "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                    "sec-ch-ua-mobile": '?0',
                    "sec-ch-ua-platform": "Windows",
                    "IPTYPE": "XML",
                    "Referer": nextReferer,
                    "X-Requested-With": "XMLHttpRequest",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
                }
            }
        ).then(function (response) {
            currentView = response.data;
            monoscraper.loadPage(currentView);
            mergeCookies(response.headers['set-cookie']);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on extracting account summary snippet";
            console.log(err)
            return responsePayload;
        });

        /* Scrape useful account details */
        accountNumber = monoscraper.locateGetElement(constants.UBA.MARKERS.ACCTNUMBER).text().trim();
        accountNickname = monoscraper.locateGetElement(constants.UBA.MARKERS.ACCTSUMMARYDETAILSHREF).text().trim();
        
        /* Scrape and Build parameters for loading the landing page for account transaction history filtering */
        nextUrl = monoscraper.locateGetAttribute(constants.UBA.MARKERS.ACCTSUMMARYDETAILSHREF, 'href');
        nextUrl = constants.UBA.URLS.NGBASEURL + nextUrl;
        reqIdcookie = generateRequestIdCookie_finParam(nextUrl, xNum, undefined);
        saveRequestidCookie('Requestid=' + reqIdcookie + ';Path=/');

        /* Visit the landing page where transaction history filtering will occur */
        mergeCookies(["userType=1", "bankId=NG", "languageId=001"]);
        await ubaPostman.get(
            nextUrl,
            {
                headers: {
                    cookie: ubaJar.Cookies,
                    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                    "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                    "sec-ch-ua-mobile": '?0',
                    "sec-ch-ua-platform": "Windows",
                    "sec-ch-ua-platform": "Windows",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                    "Accept-Encoding": "gzip, deflate, br",
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Upgrade-Insecure-Requests": "1",
                    "Referer": nextReferer,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
                }
            }
        ).then(response => {
            currentView = response.data;
            monoscraper.loadPage(currentView);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on loading transaction history filtering landing page";
            console.log(err)
            return responsePayload;
        });

        nextReferer = nextUrl; //The current page is the transaction history filtering page

        reqIdcookie = generateRequestIdCookie_finParam(nextUrl, xNum, undefined);
        saveRequestidCookie('Requestid=' + reqIdcookie + ';Path=/');


        await extractFEBAObjects(constants.UBA.MARKERS.TRANSFILTERDASHBOARD, monoscraper);
        if (FEBAObjects) {
            nextUrl = FEBAObjects.baseUrl;
        }
        else {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Cannot retrieve Transaction Filtering Form Page. ";
            return responsePayload;
        }

        nextUrl = constants.UBA.URLS.NGBASEURL + nextUrl;

        finParam = generateRequestIdCookie_finParam(nextUrl, xNum, loggedinReqId);

        let transHistFilterURL = monoscraper.locateGetAttribute(constants.UBA.MARKERS.TRANSFILTERHREF, 'action');
        transHistFilterURL = transHistFilterURL.replace("Finacle", "FinacleRiaRequest");
        let transfilterformobject = {};

        //#region
        /* Attempt to load the transaction history page snippet via Ajax post */
        await ubaPostman.post(nextUrl,
            `{"WID_CONF":"PageConfigurationMaster_ASWMSTW__1","PARENT_MENU_FOR_REMOVE":"ASWMST","GROUPLETS_IN_PAGE":",PageConfigurationMaster_ASWMSTW__1"}&target=PageConfigurationMaster_ASWMSTW__1&requestId=${loggedinReqId}`,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    cookie: ubaJar.Cookies,
                    "finParam": finParam,
                    "requestId": loggedinReqId,
                    "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                    "sec-ch-ua-mobile": '?0',
                    "sec-ch-ua-platform": "Windows",
                    "IPTYPE": "XML",
                    "Referer": nextReferer,
                    "X-Requested-With": "XMLHttpRequest",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
                }
            }
        ).then(function (response) {
            currentView = response.data;
            monoscraper.loadPage(currentView);
            mergeCookies(response.headers['set-cookie']);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on extracting transaction history filtering ajax snippet.";
            console.log(err)
            return responsePayload;
        });
        //#endregion

        /* Extract the form elements that form the transaction history payload */
        monoscraper.locateGetElement("input, select").each(
            function (index) {
                var input = monoscraper.getTransverser()(this);
                transfilterformobject[input.attr('name')] = input.val();
            }
        );

        /*Populate the values of the required parameters */
        transfilterformobject['TransactionHistoryFG.SELECTED_RADIO_INDEX'] = 0;
        transfilterformobject['TransactionHistoryFG.FROM_TXN_DATE'] = "01%2F06%2F2022"; //startDate parameter from request payload
        transfilterformobject['TransactionHistoryFG.FROM_TXN_DATE_submit'] = "01%2F06%2F2022"; //startDate parameter from request payload
        transfilterformobject['TransactionHistoryFG.TO_TXN_DATE'] = "10%2F07%2F2022"; //endDate parameter from request payload
        transfilterformobject['TransactionHistoryFG.TO_TXN_DATE_submit'] = "10%2F07%2F2022"; //endDate parameter from request payload
        transfilterformobject['autocomplete-dropdown'] = "Type to search";
        transfilterformobject['autocomplete-dropdown'] = "All";
        transfilterformobject['TransactionHistoryFG.TXN_CATEGORY_ID'] = "-1";
        transfilterformobject['autocomplete-dropdown'] = "All";
        transfilterformobject['TransactionHistoryFG.AMOUNT_TYPE'] = "All";
        transfilterformobject['autocomplete-dropdown'] = "Type to search";
        transfilterformobject['TransactionHistoryFG.CONTROLIDLISTING'] = "TransactionListing";
        transfilterformobject['TransactionHistoryFG.TEMPLATELISTING'] = "SearchTemplate";
        transfilterformobject['TransactionHistoryFG.MAPNAME'] = "OpTransactionListing";
        transfilterformobject['TransactionHistoryFG.INITIATOR_ACCOUNT'] = "2267077360"; //Retrieved from the page in previous milestones
        transfilterformobject['GROUPLET_FORMSGROUP_ID__'] = "TransactionHistoryFG";
        transfilterformobject['TransactionHistoryFG.REPORTTITLE'] = "OpTransactionHistoryUX5";
        transfilterformobject['RIA_TARGETS'] = ",,,,,,,,";
        transfilterformobject['JS_ENABLED_FLAG'] = "Y";
        transfilterformobject['DECRYPT_FLAG'] = "N";
        transfilterformobject['Requestid'] = "1";
        transfilterformobject['TransactionHistoryFG.__COLLAPSIBLE_IDS__'] = "PageConfigurationMaster_ASWMSTW__1:SearchPanel_Stage3_Extended_midAligned19.SubSectionHeader1,PageConfigurationMaster_ASWMSTW__1:SearchPanel_Stage3_Extended_midAligned19#PageConfigurationMaster_ASWMSTW__1:SearchPanel_Stage3_Extended_midAligned19.SubSection1,C|";
        transfilterformobject['PageConfigurationMaster_ASWMSTW__1'] = "";
        transfilterformobject['Action.SEARCH'] = "Search";
        transfilterformobject['__GROUPLET_NAME__'] = "PageConfigurationMaster_ASWMSTW__1";
        transfilterformobject['__RIA__'] = "GROUPLET";
        transfilterformobject['GROUPLETS_IN_PAGE'] = ",PageConfigurationMaster_ASWMSTW__1,PageConfigurationMaster_W50__1,PageConfigurationMaster_W45__1,PageConfigurationMaster_W49__1";
        // transfilterformobject['TransactionHistoryFG.OpTransactionListing_PAGE_CHOICE_INDEX'] = 15;
        // transfilterformobject['TransactionHistoryFG.FIRST_RECORD_NUM'] = 1;
        // transfilterformobject['TransactionHistoryFG.LAST_RECORD_NUM'] = 6

        loggedinReqIdCounter = 1;
        loggedinReqId = 3 * loggedinReqIdCounter;
        nextUrl = constants.UBA.URLS.NGBASEURL + transHistFilterURL;
        finParam = generateRequestIdCookie_finParam(nextUrl, xNum, loggedinReqId);

        //#region
        /* HERE, ATTEMPT TO LOAD THE TRANSACTION HISTORY PAGE SNIPPET VIA AJAX POST */
        /* TODO:- Did not use TRANSFILTERFORMOBJECT OBJECT, will figure out later why portal is returning session-based & browser-tab-based errors  */
        /* TODO:::DONE:- Extract all 1000 transactions if available based on startdate $ enddate.  */
        let REQ_ID = 1;
        let initqueryPayload = "";
        eval("initqueryPayload = " + constants.UBA.QUERIES.INITIAL);
        await ubaPostman.post(nextUrl,
            initqueryPayload,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    cookie: ubaJar.Cookies,
                    "finParam": finParam,
                    "requestId": loggedinReqId,
                    "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                    "sec-ch-ua-mobile": '?0',
                    "sec-ch-ua-platform": "Windows",
                    "IPTYPE": "XML",
                    "Referer": nextReferer,
                    "X-Requested-With": "XMLHttpRequest",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
                }
            }
        ).then(function (response) {
            currentView = response.data;
            monoscraper.loadPage(currentView);
        }).catch(err => {
            responsePayload.responseCode = constants.responseCodes.FAILED;
            responsePayload.responseMessage = "Error Occurred on extracting transaction history filtering page.";
            console.log(err)
            return responsePayload;
        });
        //#endregion

        /*attempt to load and scrape the remaining records from paginated pages  */
        let pagination_str = monoscraper.locateGetElement(constants.UBA.MARKERS.PAGINATION_STR).find('label').text();// ' 1 - 5 of 17';
        pagination_str = pagination_str.trim();
        pagination_str = pagination_str.replaceAll(' ', ''); //1-5of17
        let pagination_str_arr = pagination_str.split('of');//['1-5', '17']
        let PAGE_CHOICE_INDEX = 5; /*this is the default selected record count per page  */
        let NEXT_FRAME_START_PAGE = PAGE_CHOICE_INDEX;

        let FIRST_RECORD_NUM = pagination_str_arr[0].split('-')[0];
        let LAST_RECORD_NUM = pagination_str_arr[1];
        let DEC_LAST_RECORD_NUM = LAST_RECORD_NUM;
        let hasMoreRecord = true;
        let CATEGORY_ID_ARRAY = 0;
        let CURRENT_ARRAY_INDEX_COUNTER = 0;

        /* Attempt to scrape transaction details and build response payload  for INITIAL*/
        let scrapedRows = [];
        const tableHeaders = [];
        const headtags = monoscraper.locateGetElement(constants.UBA.MARKERS.TRANSFILTERRESHEAD).children('tr:first');
        const ths = headtags.find("th");
        ths.each((index, element) => {
            tableHeaders.push(
                monoscraper.getTransverser()(element).text().toLowerCase().replaceAll(" ", "_")
            );
        }
        );

        monoscraper.locateGetElement(constants.UBA.MARKERS.TRANSFILTERRESBODY).each(
            function (index, element) {
                DEC_LAST_RECORD_NUM = DEC_LAST_RECORD_NUM - 1;
                const firsttr = monoscraper.getTransverser()(element).children('tr:first');
                const tds = firsttr.find("td");
                const onetableRow = {};
                tds.each((index, element) => {
                    onetableRow[tableHeaders[index]] = monoscraper.getTransverser()(element).text().trim().replaceAll("\n", "");
                });
                /* pretiffy and remove unneccessaries  */
                onetableRow["transaction_status"] = (!onetableRow['withdrawal'] || onetableRow['withdrawal'].length === 0) ? 'CREDIT' : 'DEBIT';
                onetableRow['transaction_value'] = (!onetableRow['withdrawal'] || onetableRow['withdrawal'].length === 0) ? onetableRow['deposit'] : onetableRow['withdrawal'];
                delete onetableRow['withdrawal'];
                delete onetableRow['deposit'];
                delete onetableRow['cheque_number'];
                delete onetableRow['category'];
                scrapedRows.push(onetableRow);
            });

        /*there is no more record to paginate after the initial scrapings */
        if (DEC_LAST_RECORD_NUM == 0) {
            responsePayload.responseCode = constants.responseCodes.SUCCESS;
            responsePayload.responseMessage = "Successfully retrieved!";
            responsePayload.data = scrapedRows;
            return responsePayload;
        }

        /*attempt to load all available pages */
        while (hasMoreRecord) {

            REQ_ID = REQ_ID + 1;
            loggedinReqIdCounter = loggedinReqIdCounter + 1;
            loggedinReqId = 3 * loggedinReqIdCounter;

            reqIdcookie = generateRequestIdCookie_finParam(nextUrl, xNum, undefined);
            saveRequestidCookie('Requestid=' + reqIdcookie + ';Path=/');

            finParam = generateRequestIdCookie_finParam(nextUrl, xNum, loggedinReqId);

            /*build the request payload string for pagination  */
            let CURRENT_ARRAY_INDEXSTR = "";
            for (let CURRENT_ARRAY_INDEX = CURRENT_ARRAY_INDEX_COUNTER; CURRENT_ARRAY_INDEX < (CURRENT_ARRAY_INDEX_COUNTER + PAGE_CHOICE_INDEX); CURRENT_ARRAY_INDEX++) {
                let one_CURRENT_ARRAY_INDEXSTR = "";
                eval("one_CURRENT_ARRAY_INDEXSTR = " + constants.UBA.QUERIES.CATEGORY_ID_ARRAY_TEMPLATE);
                CURRENT_ARRAY_INDEXSTR = CURRENT_ARRAY_INDEXSTR + one_CURRENT_ARRAY_INDEXSTR;
            }
            CURRENT_ARRAY_INDEX_COUNTER = CURRENT_ARRAY_INDEX_COUNTER + PAGE_CHOICE_INDEX;

            let subseq_1 = "";
            eval("subseq_1 = " + constants.UBA.QUERIES.SUBSEQUENT_1);

            let subseqq = "";
            eval("subseqq = " + constants.UBA.QUERIES.SUBSEQUENT);

            let subseq_2 = "";
            eval("subseq_2 = " + constants.UBA.QUERIES.SUBSEQUENT_2);
            
            let subsequentqueryPayload = subseq_1 + "&" + subseqq + subseq_2;

            //#region
            /* HERE, ATTEMPT TO LOAD THE TRANSACTION HISTORY PAGE SNIPPET VIA AJAX POST */
            await ubaPostman.post(nextUrl,
                subsequentqueryPayload,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        cookie: ubaJar.Cookies,
                        "finParam": finParam,
                        "requestId": loggedinReqId,
                        "sec-ch-ua": '" Not A;Brand";v="99", "Chromium";v="102", "Google Chrome";v="102"',
                        "sec-ch-ua-mobile": '?0',
                        "sec-ch-ua-platform": "Windows",
                        "IPTYPE": "XML",
                        "Referer": nextReferer,
                        "X-Requested-With": "XMLHttpRequest",
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36"
                    }
                }
            ).then(function (response) {
                currentView = response.data;
                monoscraper.loadPage(currentView);
            }).catch(err => {
                responsePayload.responseCode = constants.responseCodes.FAILED;
                responsePayload.responseMessage = "Error Occurred on extracting transaction history filtering page.";
                console.log(err)
                return responsePayload;
            });
            //#endregion

            /*ATTEMPT TO  SCRAPE LOADED PAGE*/
            let pagedscrapedRows = [];

            monoscraper.locateGetElement(constants.UBA.MARKERS.TRANSFILTERRESBODY).each(
                function (index, element) {
                    DEC_LAST_RECORD_NUM = DEC_LAST_RECORD_NUM - 1;
                    const firsttr = monoscraper.getTransverser()(element).children('tr:first');
                    const tds = firsttr.find("td");
                    const onetableRow = {};
                    tds.each((index, element) => {
                        onetableRow[tableHeaders[index]] = monoscraper.getTransverser()(element).text().trim().replaceAll("\n", "");
                    });
                    /* pretiffy and remove unneccessaries */
                    onetableRow["transaction_status"] = (!onetableRow['withdrawal'] || onetableRow['withdrawal'].length === 0) ? 'CREDIT' : 'DEBIT';
                    onetableRow['transaction_value'] = (!onetableRow['withdrawal'] || onetableRow['withdrawal'].length === 0) ? onetableRow['deposit'] : onetableRow['withdrawal'];
                    delete onetableRow['withdrawal'];
                    delete onetableRow['deposit'];
                    delete onetableRow['cheque_number'];
                    delete onetableRow['category'];
                    pagedscrapedRows.push(onetableRow);
                });

            if (DEC_LAST_RECORD_NUM == 0) {
                hasMoreRecord = false;
            }

            scrapedRows = scrapedRows.concat(pagedscrapedRows);

        }
        console.log(scrapedRows);


        responsePayload.responseCode = constants.responseCodes.SUCCESS;
        responsePayload.responseMessage = "Successfully retrieved!";
        responsePayload.data = scrapedRows;
        return responsePayload;
    }
    catch (e) {
        console.log(e);
        responsePayload.responseCode = constants.responseCodes.FAILED;
        responsePayload.responseMessage = "System cannot determine Login status. Kindly try again later.";
        return responsePayload;
    }

}

//#region Private service functions
function extractUbaToken(loadedparser) {
    var jscripts = loadedparser.locateGetElement(constants.UBA.MARKERS.TOGETTOKEN).text().trim();
    var s = jscripts.split("'")[3];
    var c = jscripts.split("'")[4].substring(1, 2);

    var s1 = unescape(s.substr(0, s.length));
    var decrypted = '';
    for (i = 0; i < s1.length; i++) {
        decrypted += String.fromCharCode(s1.charCodeAt(i) - c);
    }
    decrypted = unescape(decrypted);
    var decryptedsplits = decrypted.split('"');
    
    return decryptedsplits[9];
}
async function extractFEBAObjects(tag, loadedparser) {
    try {
        var jscripts = loadedparser.locateGetElement(tag).text().trim();
        jscripts = jscripts.replace(");", "");
        jscripts = jscripts.split('(')[1];
        jscripts = ' FEBAObjects = ' + jscripts;
        eval(jscripts);
        
        if (FEBAObjects.baseUrl) {
            var criteria = FEBAObjects.criteria.replaceAll(' ', '');
            criteria = criteria.replaceAll('=', '":"');
            criteria = criteria.replaceAll('::', '","');
            criteria = `criteria={"` + criteria + `"}`;
            FEBAObjects.criteria = criteria;
            nextWidgetUrl = FEBAObjects.baseUrl;
        }
    }
    catch (err) {
        console.log(err);
        return null;
    }
}
function generateRequestIdCookie_finParam(hrefURL, xNum, requestId) {
    try {
        var bwayparam = "";
        var uriComponents = hrefURL.split('?')[1];
        var uriValues = uriComponents.split('&');
        var bwayParamtoHash = '';
        if (hrefURL != null) {
            for (var i = 0; i < uriValues.length; i++) {
                var name = uriValues[i].split('=')[0];
                if (name == 'bwayparam') {
                    bwayparam = uriValues[i].split('=')[1];
                    bwayparam = decodeURIComponent(bwayparam);
                }
            }
            bwayparam = bwayparam.replace(/\s/g, "");
            var bwayparamLength = bwayparam.length;
            if (bwayparamLength > 10) {
                bwayParamtoHash = bwayparam.substring(bwayparamLength - 10);
            }
            else {
                bwayParamtoHash = bwayparam;
            }
        }

        if (requestId != undefined) {
            bwayParamtoHash = bwayParamtoHash + requestId;
        }
        var hash = CryptoJS.HmacSHA256(bwayParamtoHash, xNum);
        var hashInBase64 = CryptoJS.enc.Base64.stringify(hash);
        return encodeURIComponent(hashInBase64);

    } catch (e) {
        console.log(e);
        console.log("###Error while Hashing for cookie ####");
    }

}
function saveRequestidCookie(newreqidcookie) {
    if (ubaJar.Cookies != undefined) {
        removeCookieStartWith("Requestid=");
        ubaJar.Cookies = ubaJar.Cookies.filter(e => !(e.trim().startsWith("Requestid=")));
        ubaJar.Cookies.push(newreqidcookie);
    }
    else {
        ubaJar.Cookies = [];
        ubaJar.Cookies.push(newreqidcookie);;
    }
}
function mergeCookies(responseCookies) {
    /*Merge response cookies with cached cookies for next request's use, remove duplicates also */
    ubaJar.Cookies = ubaJar.Cookies.concat(responseCookies);
    ubaJar.Cookies = ubaJar.Cookies.filter((item, pos) => ubaJar.Cookies.indexOf(item) === pos);
}
function removeCookieStartWith(cookiestartswithtoremove) {
    if (ubaJar.Cookies != undefined) {
        ubaJar.Cookies = ubaJar.Cookies.filter(e => !(e.trim().startsWith(cookiestartswithtoremove)));
    }
}
//#endregion


module.exports = {
    loginToGTB: gtbLogin,
    spoolGTBTransactions: gtbTransactions,
    loginToUBA: ubaLogin,
    spoolUBATransactions: ubaTransactions,
}