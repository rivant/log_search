const util = require('./utils');
const cp = require('child_process');
const fs = require('fs');

module.exports = {
  range: {},

  run: function(params, callBack){
    this.range = util.dateRange(params.start, params.end);
		
		// Create temporary key to hold encryption key value
		params.tmpSearchKey = Date.now();

    this.logSearch(params, function(data){
      callBack(data);
    });
  },

  logSearch: function(params, callBack){
    var searchResult = {};
		process.env[params.tmpSearchKey] = util.createKey();
    
    this.encrypt(params.userPass, process.env[params.tmpSearchKey], (err, encrypted, stderr) => {
      if (encrypted) {
				var searchResult = cp.spawn('shell/access.sh',
       	  [params.userID, params.serverIP, params.source, params.pattern,
    	    this.range.end, this.range.start, params.tmpSearchKey, params.dest, encrypted]);			
      } else { searchResult = stderr; }

			callBack(searchResult);
    });
  },
	
  encrypt: function(txt, key, callBack){				
    cp.exec('echo "'+ txt +'" | openssl enc -aes-128-cbc -a -pass pass:"'+ key +'"', (err, encrypted, stderr) => {
      callBack(err, encrypted, stderr);
    })
  },

  updateAdapterLists: function(serverParams){
		serverParams.tmpSrcListKey = Date.now() + 1;
		serverParams.tmpDstListKey = Date.now() + 2;
		
    this.getSrcAdapterList(serverParams);
    this.getDstAdapterList(serverParams);
  },
	
	writeStreamResult: function(params, stream, type){
		stream.stdout.on('data', (list) => {
			fs.writeFile('./store/'+ params.serverIP +'.'+ type +'.'+ params.serverType, list, 'utf8', () => {});
		});
		stream.stderr.on('data', (err) => {
			fs.writeFile('./store/adapterList'+ type +'error.log', 'utf8', () => {});
		});
		stream.on('close', () => {});
	},

  getSrcAdapterList: function(params){		
		process.env[params.tmpSrcListKey] = util.createKey();				

		this.encrypt(params.userPass, process.env[params.tmpSrcListKey], (err, encrypted, stderr) => {
      if (encrypted) {
				var srcList = cp.spawn('shell/accessConfig.sh',
					[params.userID, params.serverIP, 'SOURCE', params.tmpSrcListKey, encrypted]);
			} else { srcList = stderr }
			
			this.writeStreamResult(params, srcList, 'src');
		})
  },

  getDstAdapterList: function(params){
		process.env[params.tmpDstListKey] = util.createKey();
		
    this.encrypt(params.userPass, process.env[params.tmpDstListKey], (err, encrypted, stderr) => {
      if (encrypted) {
				var dstList = cp.spawn('shell/accessConfig.sh',
					[params.userID, params.serverIP, 'DEST', params.tmpDstListKey, encrypted]);
			} else { dstList = stderr }
			
			this.writeStreamResult(params, dstList, 'dst');
		})
  }
};
