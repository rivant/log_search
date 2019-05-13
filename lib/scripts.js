const cp = require('child_process');
const fs = require('fs');
const makeKey = require('crypto');

module.exports = {
	serverParams: {},

  searchLogs: function(params, callBack){
    let range = this.dateRange(params.start, params.end);
    params.tmpSearchKey = makeKey.randomBytes(16).toString('base64');

    this.encrypt(params.userPass, params.tmpSearchKey, (err, encrypted, stderr) => {
      if (encrypted) {        
        let results = cp.spawn('shell/access.sh', [params.userID, params.serverIP, params.source, '"'+params.pattern+'"',
          range.end, range.start, params.tmpSearchKey, params.dest, params.destAdapterLocation, encrypted],
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
		params.tmpSrcKey = makeKey.randomBytes(16).toString('base64');		

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
		params.tmpDstKey = makeKey.randomBytes(16).toString('base64');		

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
	},
  
  dateRange: function(start, end){
    let startDateFormat = start.slice(5,10) + '-' + start.slice(0,4),
      endDateFormat = end.slice(5,10) + '-' + end.slice(0,4),
      startDate = new Date(startDateFormat),
      endDate = new Date(endDateFormat),
      startNumber = Math.ceil((Date.now() - startDate.getTime()) / (1000*3600*24)),
      endNumber = Math.floor((Date.now() - endDate.getTime()) / (1000*3600*24));
    return { end: endNumber, start: startNumber };
  }
};