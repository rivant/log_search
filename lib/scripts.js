var util = require('./utils.js');
const cp = require('child_process');

module.exports = {
   range: {},

   run: function(thisScript, params, callBack){
      this.range = util.dateRange(params.Start, params.End);

      this['search' + thisScript](params, function(data){
         callBack(data);
      });
   },

	searchLocal: function(params, callBack){
		var local = cp.spawn('shell/matches.sh',
         [params.Source, params.Pattern, this.range.end, this.range.start, params.Dest]);

      callBack(local);
   },

	searchRemote: function(params, callBack){
		var encryptedPW = '';
		process.env[params.tempKey] = util.createKey();
		
		this.encrypt(params.Password, process.env[params.tempKey], (err, encrypted, stderr) => {
			if (encrypted) {
				encryptedPW = encrypted;												
			} else {
				encryptedPW = stderr;
			}

			var remoteResult = cp.spawn('shell/remote_access.sh',
				[params.UserId, params.Server, params.Source, params.Pattern,
					this.range.end, this.range.start, params.tempKey, params.Dest, encryptedPW]);

			callBack(remoteResult);
		});
  },
	
	encrypt: function(text, key, callBack){
			var encrypt = cp.exec('echo "'+ text +'" | openssl enc -aes-128-cbc -a -pass pass:"'+ key +'"', (err, encrypted, stderr) => {
				callBack(err, encrypted, stderr);
			})
	 },
	 
	 decrypt: function(text, key, callBack){
			var encrypt = cp.exec('echo "'+ text +'" | openssl enc -aes-128-cbc -a -d -pass pass:"'+ key +'"', (err, decrypted, stderr) => {
				callBack(err, decrypted, stderr);
			})
	 },
	
	copyRemote: function(category, params, callBack){
		var remoteFiles = cp.spawn('shell/remote_copy.sh',
         [params.UserId, params.Server, params.tempKey, category]);

      callBack(remoteFiles);
	},

  regionSrcList: function(){
    var sources = cp.spawnSync('shell/region_src_list.sh', { encoding: 'utf8' }),
				list = '';

    if (typeof(sources.output[1]) === 'string') {
      list = sources.output[1];
    }
    return list;
  },

  regionDstList: function(){
    var dests = cp.spawnSync('shell/region_dst_list.sh', { encoding: 'utf8' }),
				list = '';

    if (typeof(dests.output[1]) === 'string') {
      list = dests.output[1];
    }
    return dests.output;
  }	 	
};
