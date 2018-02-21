var util = require('./utils.js');
const spawn = require('child_process').spawn,
      spawnSync = require('child_process').spawnSync;

module.exports = {
   range: {},

   run: function(thisScript, params, callBack){
      this.range = util.dateRange(params.Start, params.End);

      this['search' + thisScript](params, function(data){
         callBack(data);
      });
   },

	searchLocal: function(params, callBack){
		var local = spawn('shell/matches.sh',
         [params.Source, params.Pattern, this.range.end, this.range.start, params.Dest]);

      callBack(local);
   },

	searchRemote: function(params, callBack){
		process.env[params.tempTitle] = params.Password;
		
      var remote = spawn('shell/remote_access.sh',
         [params.UserId, params.Server, params.Source,
          params.Pattern, this.range.end, this.range.start, params.tempTitle, params.Dest]);

      callBack(remote);
   },
	
	copyRemote: function(category, params, callBack){
		var remoteFiles = spawn('shell/remote_copy.sh',
         [params.UserId, params.Server, params.tempTitle, category]);

      callBack(remoteFiles);
	},

   regionSrcList: function(){
      var sources = spawnSync('shell/region_src_list.sh', { encoding: 'utf8' }),
          list = '';

      if (typeof(sources.output[1]) === 'string') {
         list = sources.output[1];
      }
      return list;
   },

   regionDstList: function(){
      var dests = spawnSync('shell/region_dst_list.sh', { encoding: 'utf8' }),
          list = '';

      if (typeof(dests.output[1]) === 'string') {
         list = dests.output[1];
      }
      return dests.output;
   }
};
