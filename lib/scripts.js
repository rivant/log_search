var util = require('./utils.js');
const spawn = require('child_process').spawn,
      spawnSync = require('child_process').spawnSync;

module.exports = {
   searchMatches: function(params, callBack){
      var range = util.dateRange(params.Start, params.End),
          matches = spawn('shell/matches.sh', [params.Source, params.Pattern, range.end, range.start, params.Dest]);

      callBack(matches);
   },

   regionSrcList: function(){
      var sources = spawnSync('shell/region_src_list.sh', { encoding: 'utf8' }),
          list = '';

      if (typeof(sources.output[1]) === 'string') {
         list = sources.output[1];
      }
      return list;
   },

   regionDstList: function(callBack){
      var dests = spawnSync('shell/region_dst_list.sh', { encoding: 'utf8' }),
          list = '';

      if (typeof(dests.output[1]) === 'string') {
         list = dests.output[1];
      }
      return dests.output;
   }
}
