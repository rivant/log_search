var util = require('./utils.js'),
    parse = require('./parsers.js');
const spawn = require('child_process').spawn,
      spawnSync = require('child_process').spawnSync;

module.exports = {
   params: {},
   range: {},
   srcObj: {},

   processScripts: function(params, callBack){
      this.params = params;
      this.range = util.dateRange(this.params.Start, this.params.End);

      this.srcMatches(function(destMatch){
         callBack(destMatch);
      });
   },

   srcMatches: function(callBack){
      var srcData = '', error = '',
          srcMatches = spawn('shell/src_matches.sh', [this.params.Source, this.params.Pattern, this.range.end, this.range.start]);

      srcMatches.stdout.on('data', (info) => { srcData += info; })
      srcMatches.stderr.on('data', (err) => { error += err; });
      srcMatches.on('close', (code) => {
         if (error == '') {
            this.srcObj = parse.source(srcData, 'ACKCODE', {});
            this.destMatches(function(destMatch){ callBack(destMatch) });
         } else { callBack(error); }
      });
   },

   destMatches: function(callBack){
      var corelIds = parse.corelIds(this.srcObj),
          matches = spawn('shell/dest_matches.sh', [this.params.Dest, this.range.end, this.range.start, corelIds]);
      callBack(matches);
   },

   regionSrcList: function(){
      var list = '',
          sources = spawnSync('shell/region_src_list.sh', { encoding : 'utf8' });

      return sources.stdout.split('\n');
   },

   regionDstList: function(callBack){
      var list = '',
          dests = spawn('shell/region_dst_list.sh');

      dests.stdout.on('data', (info) => { list += info; })
      dests.on('close', (code) => {
         callBack(list);
      });
   }
}
