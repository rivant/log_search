const cp = require('child_process');
const fs = require('fs');
const util = require('../lib/utils');

module.exports = {
  range: {},
	serverParams: {},

  searchLogs: function(params, callBack){
    this.range = util.dateRange(params.start, params.end);
    params.tmpSearchKey = util.createKey();

    this.encrypt(params.userPass, params.tmpSearchKey, (err, encrypted, stderr) => {
      if (encrypted) {        
        let results = cp.spawn('shell/access.sh', [params.userID, params.serverIP, params.source, '"'+params.pattern+'"',
          this.range.end, this.range.start, params.tmpSearchKey, params.dest, params.destAdapterLocation, encrypted],
          {shell: true});

        callBack(results);
      }			
    });
  },
	
  encrypt: function(txt, key, callBack){				
    cp.exec('echo "'+ txt +'" | openssl enc -aes-128-cbc -a -pass pass:"'+ key +'"', (err, encrypted, stderr) => {
      callBack(err, encrypted, stderr);
    })
  },

  updateAdapterLists: function(params){
		this.serverParams.serverIP = params.serverIP;
		this.serverParams.serverType = params.serverType;
		
    this.getSrcAdapterList(params);
    this.getDstAdapterList(params);
  },

  getSrcAdapterList: function(params){		
		params.tmpSrcKey = util.createKey();		

		this.encrypt(params.userPass, params.tmpSrcKey, (err, encrypted, stderr) => {
      if (encrypted) {
				cp.exec("shell/accessConfig.sh "+ params.userID +" "+ params.serverIP +" "+ params.serverType +" SOURCE "+ params.tmpSrcKey +" "+ encrypted,
					(err, list, stderr) => {
						if (list){	
							fs.writeFile('./store/'+ this.serverParams.serverIP +'.src.'+ this.serverParams.serverType, list.trim(), function(){});
						}
				});
			}
		});
  },

  getDstAdapterList: function(params){
		params.tmpDstKey = util.createKey();		

		this.encrypt(params.userPass, params.tmpDstKey, (err, encrypted, stderr) => {
      if (encrypted) {
				cp.exec("shell/accessConfig.sh "+ params.userID +" "+ params.serverIP +" "+ params.serverType +" DEST "+ params.tmpDstKey +" "+ encrypted,
					(err, list, stderr) => {
						if (list){	
							fs.writeFile('./store/'+ this.serverParams.serverIP +'.dst.'+ this.serverParams.serverType, list.trim(), function(){});
						}
				});
			}
		});
	}
};