const GTBpublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAquiugN6mW6EsNIxDAVtFovN1yGHEaQNybzkgmBp+hbgfS5knFsMcPMRNE1NqM6fOLwnJue43PouBAIkdvVNfg6sKMeJpg2Lc8LyXjtSr0xnOR0JFxwHrPQGxw33G0oKdi7wFlhZYQvCdNNe59dS2uKuYx0PKgVJlcrdZdwYqdOdUTFcbt1U2WFLfjLdS5wph0CiNxMyfSbSoQzmTKsMeg4QKRO/ZZCVLjoOdhJdpAgrUL3nnLu5w90BDJDtR0AJoAbX0gi0daIh/XqU3+XRbLTPaWmpkHjGFpiN5PtOxwLr2uFrqw9sGH3aLUfGCNGGsdZKipacF5GcncRrv5rUFcQIDAQAB
-----END PUBLIC KEY-----`
module.exports = {
    GTB: {
        URLS: {
            BASEURL: "https://gtworld.gtbank.com/GTWorldApp/api",            
            get NGBASEURL() { return `${this.BASEURL}/Authentication/login-enc` },
            get HISTORYURL() { return `${this.BASEURL}/Account/new-account-history-two` }
        },
        ENCKEY: GTBpublicKey,
        CHANNEL: "GTWORLDv1.0",
        APPVERSION: "1.10.1",
        STOREPREFIX: "GTBSTORE_"
    },
    UBA: {
        URLS: {
            BASEURL: "https://ibank.ubagroup.com",            
            get NGBASEURL() { return `${this.BASEURL}/obng/` }
        },
        STOREPREFIX: "UBASTORE_",
        ENCKEY: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAquiugN6mW6EsNIxDAVtFovN1yGHEaQNybzkgmBp+hbgfS5knFsMcPMRNE1NqM6fOLwnJue43PouBAIkdvVNfg6sKMeJpg2Lc8LyXjtSr0xnOR0JFxwHrPQGxw33G0oKdi7wFlhZYQvCdNNe59dS2uKuYx0PKgVJlcrdZdwYqdOdUTFcbt1U2WFLfjLdS5wph0CiNxMyfSbSoQzmTKsMeg4QKRO/ZZCVLjoOdhJdpAgrUL3nnLu5w90BDJDtR0AJoAbX0gi0daIh/XqU3+XRbLTPaWmpkHjGFpiN5PtOxwLr2uFrqw9sGH3aLUfGCNGGsdZKipacF5GcncRrv5rUFcQIDAQAB",
        BROWSERPARAMS:{
            DEVICEDNA: '{"VERSION":"1.0","MFP":{"System":{"Platform":"Win32","Language":"en-GB","Timezone":-60,"Fonts":""},"Screen":{"FullHeight":720,"AvlHeight":680,"FullWidth":1280,"AvlWidth":1280,"BufferDepth":"","ColorDepth":24,"PixelDepth":24,"DeviceXDPI":"","DeviceYDPI":"","FontSmoothing":"","UpdateInterval":""},"Browser":{"UserAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36","Vendor":"Google Inc.","VendorSubID":"","BuildID":"","CookieEnabled":true},"Camera":"","Microphone":""},"MAC":"","ExternalIP":"0.0.0.0.0.0","InternalIP":"","MESC":"mi=2;cd=200;id=50;mesc=1058736;ldi=220;mesc=1506544;ldi=211","DESC":""}',
            EXECTIME: "1247",
            DRPDWN1: "Nigeria",
            DRPDWN2: "English",
            DUMMY1: "13323",
            DUMMY2: "1332",
            DESC: "",
            MESC: "mi=2;cd=200;id=50;mesc=1058736;ldi=220;mesc=1506544;ldi=211",
            DNAERR: "",
            MESCITRCOUNT: "2",
            ISDNADONE: "true",
            ARCOTFLASHCOOKIE: "",
            DEVICEID: null,
            DEVICETYPE: "DEVICEID.HTTP",
            MACHINEFINGERPRINT: '{"VERSION":"1.0","MFP":{"System":{"Platform":"Win32","Language":"en-GB","Timezone":-60,"Fonts":""},"Screen":{"FullHeight":720,"AvlHeight":680,"FullWidth":1280,"AvlWidth":1280,"BufferDepth":"","ColorDepth":24,"PixelDepth":24,"DeviceXDPI":"","DeviceYDPI":"","FontSmoothing":"","UpdateInterval":""},"Browser":{"UserAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36","Vendor":"Google Inc.","VendorSubID":"","BuildID":"","CookieEnabled":true},"Camera":"","Microphone":""},"MAC":"","ExternalIP":"1.1.0.0.0.0","InternalIP":"","MESC":"mi=2;cd=200;id=50;mesc=1058736;ldi=220;mesc=1506544;ldi=211","DESC":""}',
            TRANSURLLOC: "a#HREF_RetailUserDashboardUX5_WAC85__1\\:AccountSummaryFG\\.OPR_ACCOUNT_NUMBER_ARRAY\\[0\\]"
        },
        MARKERS: {
            AUTHENTICATIONFORM: 'form[name="AuthenticationFG"]',
            TOGETTOKEN: 'script[enc="perish"]',
            RETAILUSERDASHBOARD: 'div#RetailUserDashboardUX5_WAC85__1 script',
            ACCTNUMBER: '#HWListTable10072682 > tbody > tr > td:nth-child(2) > span',
            ACCTSUMMARYDETAILSHREF: '#HWListTable10072682 > tbody > tr > td:nth-child(1) > a',
            TRANSFILTERDASHBOARD: 'div#PageConfigurationMaster_ASWMSTW__1 script',
            TRANSFILTERHREF: 'form[name="PageMasterFG"]',
            TRANSFILTERRESBODY: '#HWListTable5134192 > tbody',
            TRANSFILTERRESHEAD: '#HWListTable5134192 > thead',
            PAGINATION_STR: '#HWListTable5134192_Footer > div.content.info-division > span.navigation-status > span.text.pagination-status'
        },
        QUERIES: { 
            INITIAL: '`TransactionHistoryFG.SELECTED_RADIO_INDEX=0&TransactionHistoryFG.FROM_TXN_DATE=${encodeURIComponent(startdate)}&TransactionHistoryFG.FROM_TXN_DATE_submit=${encodeURIComponent(startdate)}&TransactionHistoryFG.TO_TXN_DATE=${encodeURIComponent(enddate)}&TransactionHistoryFG.TO_TXN_DATE_submit=${encodeURIComponent(enddate)}&autocomplete-dropdown=Type to search&TransactionHistoryFG.TXN_PERIOD=&autocomplete-dropdown=All&TransactionHistoryFG.TXN_CATEGORY_ID=-1&TransactionHistoryFG.LAST_N_TXN=&autocomplete-dropdown=All&TransactionHistoryFG.AMOUNT_TYPE=All&TransactionHistoryFG.FROM_AMOUNT=&TransactionHistoryFG.TO_AMOUNT=&TransactionHistoryFG.FROM_INSTRUMENTID=&TransactionHistoryFG.TO_INSTRUMENTID=&autocomplete-dropdown=Type to search&TransactionHistoryFG.TEMPLATE_ACTION_TYPE=&TransactionHistoryFG.CONTROLIDLISTING=TransactionListing&TransactionHistoryFG.TEMPLATELISTING=SearchTemplate&TransactionHistoryFG.MAPNAME=OpTransactionListing&TransactionHistoryFG.INITIATOR_ACCOUNT=${encodeURIComponent(accountNumber)}&TransactionHistoryFG.CLICKED_PAGE_NO=&GROUPLET_FORMSGROUP_ID__=TransactionHistoryFG&TransactionHistoryFG.REPORTTITLE=OpTransactionHistoryUX5&RIA_TARGETS=%2C%2C%2C%2C%2C%2C%2C%2C&JS_ENABLED_FLAG=Y&DECRYPT_FLAG=N&CHECKBOX_NAMES__=&Requestid=${REQ_ID}&TransactionHistoryFG.__COLLAPSIBLE_IDS__=PageConfigurationMaster_ASWMSTW__1%3ASearchPanel_Stage3_Extended_midAligned19.SubSectionHeader1%2CPageConfigurationMaster_ASWMSTW__1%3ASearchPanel_Stage3_Extended_midAligned19%23PageConfigurationMaster_ASWMSTW__1%3ASearchPanel_Stage3_Extended_midAligned19.SubSection1%2CC%7C&Action.SEARCH=Search&__GROUPLET_NAME__=PageConfigurationMaster_ASWMSTW__1&__RIA__=GROUPLET&GROUPLETS_IN_PAGE=,PageConfigurationMaster_ASWMSTW__1,PageConfigurationMaster_W50__1,PageConfigurationMaster_W45__1,PageConfigurationMaster_W49__1`',
            SUBSEQUENT_1: '`TransactionHistoryFG.SELECTED_RADIO_INDEX=0&TransactionHistoryFG.FROM_TXN_DATE=${encodeURIComponent(startdate)}&TransactionHistoryFG.FROM_TXN_DATE_submit=${encodeURIComponent(startdate)}&TransactionHistoryFG.TO_TXN_DATE=${encodeURIComponent(enddate)}&TransactionHistoryFG.TO_TXN_DATE_submit=${encodeURIComponent(enddate)}&autocomplete-dropdown=Type to search&TransactionHistoryFG.TXN_PERIOD=&autocomplete-dropdown=All&TransactionHistoryFG.TXN_CATEGORY_ID=-1&TransactionHistoryFG.LAST_N_TXN=&autocomplete-dropdown=All&TransactionHistoryFG.AMOUNT_TYPE=All&TransactionHistoryFG.FROM_AMOUNT=&TransactionHistoryFG.TO_AMOUNT=&TransactionHistoryFG.FROM_INSTRUMENTID=&TransactionHistoryFG.TO_INSTRUMENTID=&autocomplete-dropdown=Type to search&TransactionHistoryFG.TEMPLATE_ACTION_TYPE=`',
            SUBSEQUENT: '`${CURRENT_ARRAY_INDEXSTR}`',
            CATEGORY_ID_ARRAY_TEMPLATE: '`autocomplete-dropdown=Uncategorized&TransactionHistoryFG.CATEGORY_ID_ARRAY%5B${CURRENT_ARRAY_INDEX}%5D=0&`',
            SUBSEQUENT_2: '`TransactionHistoryFG.OpTransactionListing_REQUESTED_PAGE_NUMBER=&TransactionHistoryFG.OpTransactionListing_PAGE_CHOICE_INDEX=${PAGE_CHOICE_INDEX}&TransactionHistoryFG.FIRST_RECORD_NUM=${FIRST_RECORD_NUM}&TransactionHistoryFG.LAST_RECORD_NUM=${LAST_RECORD_NUM}&TransactionHistoryFG.NEXT_FRAME_START_PAGE=${NEXT_FRAME_START_PAGE}&TransactionHistoryFG.HAS_MORE_RECORDS=false&autocomplete-dropdown=PDF&TransactionHistoryFG.OUTFORMAT=5&TransactionHistoryFG.CONTROLIDLISTING=TransactionListing&TransactionHistoryFG.TEMPLATELISTING=SearchTemplate&TransactionHistoryFG.MAPNAME=OpTransactionListing&TransactionHistoryFG.INITIATOR_ACCOUNT=${accountNumber}&TransactionHistoryFG.CLICKED_PAGE_NO=&GROUPLET_FORMSGROUP_ID__=TransactionHistoryFG&TransactionHistoryFG.REPORTTITLE=OpTransactionHistoryUX5&RIA_TARGETS=%2C%2C%2C%2C%2C%2C%2C%2C&TransactionHistoryFG.LISTING_NAMES__=OpTransactionListing&JS_ENABLED_FLAG=Y&DECRYPT_FLAG=N&CHECKBOX_NAMES__=&Requestid=${REQ_ID}&TransactionHistoryFG.__COLLAPSIBLE_IDS__=PageConfigurationMaster_ASWMSTW__1%3ASearchPanel_Stage3_Extended_midAligned19.SubSectionHeader1%2CPageConfigurationMaster_ASWMSTW__1%3ASearchPanel_Stage3_Extended_midAligned19%23PageConfigurationMaster_ASWMSTW__1%3ASearchPanel_Stage3_Extended_midAligned19.SubSection1%2CC%7C&Action.OpTransactionListing.GOTO_NEXT__=&__GROUPLET_NAME__=PageConfigurationMaster_ASWMSTW__1&__RIA__=GROUPLET&GROUPLETS_IN_PAGE=,PageConfigurationMaster_ASWMSTW__1,PageConfigurationMaster_W50__1,PageConfigurationMaster_W45__1,PageConfigurationMaster_W49__1`'
        }
    },
    responseCodes:{
        SUCCESS: "00",
        FAILED: "01"
    }
    
}