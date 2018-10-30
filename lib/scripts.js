const util = require('./utils');
const cp = require('child_process');
const fs = require('fs');

module.exports = {
  range: {},

  run: function(params, callBack){
    this.range = util.dateRange(params.Start, params.End);

    this.logSearch(params, function(data){
      callBack(data);
    });
  },

  logSearch: function(params, callBack){
    var encryptedPW = '';
    process.env[params.tempKey] = util.createKey();
    
    this.encrypt(params.Password, process.env[params.tempKey], (err, encrypted, stderr) => {
      if (encrypted) {
   	encryptedPW = encrypted;												
      } else {
    	encryptedPW = stderr;
      }
    
      var searchResult = cp.spawn('shell/access.sh',
       	  [params.UserId, params.Server, params.Source, params.Pattern,
    	    this.range.end, this.range.start, params.tempKey, params.Dest, encryptedPW]);
    
      callBack(searchResult);
    });
  },
	
  encrypt: function(text, key, callBack){
    var encrypt = cp.exec('echo "'+ text +'" | openssl enc -aes-128-cbc -a -pass pass:"'+ key +'"', (err, encrypted, stderr) => {
      callBack(err, encrypted, stderr);
    })
  },

  updateAdapterLists: function(){
    var scannedSrcList = [];
    var scannedDstList = [];
    var storedSrcList = [];
    var storedDstList = [];
    var combinedSrcLists = [];
    var combinedDstLists = [];

    this.getSrcAdapterList();
    this.getDstAdapterList();
  },

  getSrcAdapterList: function(){
    cp.exec('shell/region_src_list.sh', (err, scannedSrcData, stderr) => {
      if (scannedSrcData) {
        scannedSrcList = scannedSrcData.split(',');
        scannedSrcList.pop();
        this.getStoredSources();
      }
    })
  },

  getDstAdapterList: function(){
    cp.exec('shell/region_dst_list.sh', (err, scannedDstData, stderr) => {
      if (scannedDstData) {
        scannedDstList = scannedDstData.split(',');
        scannedDstList.pop();
        this.getStoredDestinations();
      }
    })
  },

  getStoredSources: function(){
    fs.readFile('./store/src_adapter_list.csv', 'utf8', (err, storedSrcData) => {
      if (storedSrcData)
        storedSrcList = storedSrcData.split(',');
      storedSrcList.pop();
      combinedSrcLists = scannedSrcList.concat(storedSrcList);

      fs.writeFile('./store/src_adapter_list.csv', util.uniqueArray(combinedSrcLists).toString(), 'utf8', () => {
        console.log('success');
      });
    });
  },

  getStoredDestinations: function(){
    fs.readFile('./store/dst_adapter_list.csv', 'utf8', (err, storedDstData) => {
      if (storedDstData)
        storedDstList = storedDstData.split(',');
      storedDstList.pop();
      combinedDstLists = scannedDstList.concat(storedDstList);

      fs.writeFile('./store/dst_adapter_list.csv', util.uniqueArray(combinedDstLists).toString(), 'utf8', () => {
        console.log('success');
      });
    });
  }
};
