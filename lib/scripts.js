const cp = require('child_process');
const fs = require('fs');
const makeKey = require('crypto');

module.exports = {
  searchLogs: function(params, callBack){
    const range = this.dateRange(params.start, params.end);
    params.tmpSearchKey = makeKey.randomBytes(16).toString('base64');

    this.encrypt(params.userPass, params.tmpSearchKey, (err, encrypted, stderr) => {
      if (encrypted) {        
        let results = cp.spawn('shell/access.sh', [params.userID, params.serverIP, params.source, '"'+params.pattern+'"',
          range.end, range.start, params.tmpSearchKey, params.dest, params.destAdapterLocation, encrypted],
          {shell: true});

        callBack(results);
      }			
    });
    
    this.createSrcAdapterList(params);
    this.createDstAdapterList(params);
  },
	
  encrypt: function(txt, key, callBack){				
    cp.exec('echo "'+ txt +'" | openssl enc -aes-128-cbc -a -pass pass:"'+ key +'"', (err, encrypted, stderr) => {
      callBack(err, encrypted, stderr);
    })
  },

  createSrcAdapterList: function(params){
		params.tmpSrcKey = makeKey.randomBytes(16).toString('base64');

		this.encrypt(params.userPass, params.tmpSrcKey, (err, encrypted, stderr) => {
      if (encrypted) {
				cp.exec("shell/accessList.sh "+ params.userID +" "+ params.serverIP +" "+ params.role +" SOURCE "+ params.tmpSrcKey +" "+ encrypted,
					(err, list, stderr) => {
						if (list){	
							fs.writeFile('./store/'+ params.serverIP +'.src.'+ params.role, list.trim(), function(){});
						}
				});
			}
		});
  },

  createDstAdapterList: function(params){
		params.tmpDstKey = makeKey.randomBytes(16).toString('base64');

		this.encrypt(params.userPass, params.tmpDstKey, (err, encrypted, stderr) => {
      if (encrypted) {
				cp.exec("shell/accessList.sh "+ params.userID +" "+ params.serverIP +" "+ params.role +" DEST "+ params.tmpDstKey +" "+ encrypted,
					(err, list, stderr) => {
						if (list) {
							fs.writeFile('./store/'+ params.serverIP +'.dst.'+ params.role, list.trim(), function(){});
						}
				});
			}
		});
	},
  
  dateRange: function(start, end){
    const startDateFormat = start.slice(5,10) + '-' + start.slice(0,4);
    const endDateFormat = end.slice(5,10) + '-' + end.slice(0,4);
    const startDate = new Date(startDateFormat);
    const endDate = new Date(endDateFormat);
    const startNumber = Math.ceil((Date.now() - startDate.getTime()) / (1000*3600*24));
    const endNumber = Math.floor((Date.now() - endDate.getTime()) / (1000*3600*24));
    return { end: endNumber, start: startNumber };
  }
};