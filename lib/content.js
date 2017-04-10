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
      var html = '<ul>', srcStack = dataStr.split('\n'),
          search = new RegExp(this.params.Pattern, 'g');

      if (srcStack.length > 2){
         html += '<li>'+ srcStack[0] +'</li><ul><li>'+ srcStack[1] +'</li><ul>';
         html += '<li>'+ srcStack[2].replace('\r\u001c', ' ') +'</li><ul class="destMatch">';
         this.srcTotal++;
      }
      html = this.destToHtml(dataStr, html);
      html = html.replace(search, '<mark>'+ this.params.Pattern +'</mark>');

      return html + '</ul></ul></ul></ul><script>$("#srcCount").html('+ this.srcTotal +');'
                                              + '$("#dstCount").html('+ this.dstTotal +');</script>';
   },

   destToHtml: function(dataStr, html){
      var fileArr = dataStr.match(/.*DEST.log.*\n/g), msgArr = dataStr.split('DEST.log');

      if (fileArr){
         for(idx = 0; idx < fileArr.length; idx++){
            html += '<li>'+ fileArr[idx] +'</li><ul>';
            if ( msgArr[idx + 1].includes('dummy') === false){
               html += '<li>'+ /(MSH[\s\S]*)\r\u001c/m.exec(msgArr[idx + 1])[1] +'</li></ul>';
            } else {
               html += '<li>'+ /dummy.*/.exec(msgArr[idx + 1])[0] +'</li></ul>';
            }
            this.dstTotal++;
         }
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
