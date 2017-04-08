var util = require('./utils.js'),
    script = require('./scripts.js');

module.exports = {
   params: { Source: '', Dest: '', Pattern: '', Start: '', End: '' },
   borderSource: '',
   borderPattern: '',
   msgError: '',
   msgDisplay: 'color: darkgreen',
   totalDisplay: 'hidden',
   srcTotal: 0,
   dstTotal: 0,
   
   toHtml: function(dataStr){
      var html = '<ul>', search = new RegExp(this.params.Pattern, 'g'),
          correl = /^[A-Z0-9]*/, srcFile= /.*SOURCE.*/,
          srcStartIdx = dataStr.indexOf('MSH'), srcEndIdx = dataStr.indexOf('\u001c');
          

      if (correl.test(dataStr) && srcFile.test(dataStr)){
         html += '<li>'+ correl.exec(dataStr)[0] +'</li><ul>';
         html += '<li>'+ srcFile.exec(dataStr)[0] +'</li><ul>';
         html += '<li>'+ dataStr.substring(srcStartIdx, srcEndIdx) +'</li><ul class="destMatch">';
         this.srcTotal++;
      }
      html += this.destToHtml(dataStr);
      html += '</ul></ul></ul></ul>'
      html.replace(search, '<mark>'+ this.params.Pattern +'</mark>');

      return html + '<script>$("#srcCount").html('+ this.srcTotal +');'
                          + '$("#dstCount").html('+ this.dstTotal +');</script>';
   },

   destToHtml: function(dataStr){
      var html = '', fileArr = [];

      dataStr.replace(/.*DEST.log.*\n/g, (fileName) => { fileArr.push(fileName); });
      msgArr = dataStr.split('DEST.log');
      msgArr.shift();

      for(idx = 0; idx < fileArr.length; idx++){
         html += '<li>'+ fileArr[idx] +'</li><ul>';
         if ( msgArr[idx].includes('dummy') === false){
            html += '<li>'+ /(MSH[\s\S]*)\r\u001c/m.exec(msgArr[idx])[1] +'</li></ul>';
         } else {
            html += '<li>'+ /dummy.*/.exec(msgArr[idx])[0] +'</li></ul>';
         }
         this.dstTotal++;
      }

      return html;
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
