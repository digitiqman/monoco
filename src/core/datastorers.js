var LocalStorage = require('node-localstorage').LocalStorage;
var localStorage = new LocalStorage('../localstorage');
const constants = require('./constants');

const gtbStorePREF = constants.GTB.STOREPREFIX;
const ubaStorePREF = constants.UBA.STOREPREFIX;


function setGTBStorage_One(key, value){
    localStorage.setItem(gtbStorePREF+key, value);
}
function getGTBStorage_One(key){
    return localStorage.getItem(gtbStorePREF+key) || "";
}
function getGTBStorage_All(){    
    return {
        Uuid: localStorage.getItem(gtbStorePREF+'Uuid') || "010138027759592", //Random IMEI
        UserId: localStorage.getItem(gtbStorePREF+'UserId') || '',
        AuthToken: localStorage.getItem(gtbStorePREF+'AuthToken') || '',
        SourceAccount: localStorage.getItem(gtbStorePREF+'SourceAccount') || ''
    }
}
function clearGTBStorage(){
    localStorage.clear();
}

module.exports = {
    saveOneGTBData: setGTBStorage_One,
    retrieveOneGTBData: getGTBStorage_One,
    retrieveAllGTBData: getGTBStorage_All,
    resetGTBStore: clearGTBStorage
}