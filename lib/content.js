var util = require('./utils.js'),
    script = require('./scripts.js');

module.exports = {
   params: { Source: '', Dest: '', Pattern: '', Start: '', End: '' },
   borderSource: '',
   borderPattern: '',
   msg: '',
   msgError: '',
   msgDisplay: 'color: darkgreen',
   totalDisplay: 'hidden',
   srcTotal: 0,
   dstTotal: 0,
   
   toHtml: function(obj){
      var html = '<ul>';

      Object.keys(obj).forEach( (id) => {
         html += '<li>'+ id +'</li><ul>';
         this.srcTotal++;

         html += this.secondKey(obj[id]);

         html += '</ul></ul></ul><br/>';
      });

      this.totalDisplay = 'show';
      return html + '</ul>' + '<script>$("#srcCount").html('+ this.srcTotal +');'
                            + '$("#dstCount").html('+ this.dstTotal +');</script>';
   },

   secondKey: function(obj){
      var params = this.params.Pattern, html = '';

      Object.keys(obj).forEach( (file) => {
         html += '<li>'+ file +'</li><ul>';
         html += '<li>'+ obj[file].replace(params, '<mark>'+params+'</mark>') +'</li>';

         if (file.includes('SOURCE')) { html += '<ul class="destMatch">'; }
         else {
            html += '</ul>';
            this.dstTotal++;
         }
      });
      return html;
   },

   srcDropDown: function(){
      var source = [], all = [], adapter = /[A-Z0-9]*_.*SOURCE/,
          region = /REGION\/([A-Z0-9]*)\//;

      all = script.regionSrcList().split('\n');
      all.forEach((val, idx) => {
         if (region.test(val) && adapter.test(val)){
            source[idx] = { label: adapter.exec(val)[0], category: region.exec(val)[1] };
         }
      });
      return source;
   },

   dstDropDown: function(){
      var dest = [], all = [], adapter = /[A-Z0-9]*_.*DEST/,
          region = /REGION\/([A-Z0-9]*)\//;

      script.regionDstList((list) => {
         all = list.split('\n');
         all.forEach((val, idx) => {
            if (region.test(val) && adapter.test(val)){
               dest[idx] = { label: adapter.exec(val[0]), category: region.exec(val)[1] };
            }
         });
         callBack(dest);
      });
   },

   reset: function(){
      Object.keys(this.params).forEach(key => {
         this.params[key] = '';
      });
      Object.keys(this).forEach(key => {
        if (typeof(this[key]) === 'string') { this[key] = ''; }
      });
      this.msgDisplay = 'color: darkgreen';
      this.totalDisplay = 'hidden';
      this.srcTotal = 0;
      this.dstTotal = 0;
   }
}
