module.exports = {
   params: { Source: '',
             Dest: '',
             Pattern: '',
             Start: '',
             End: '',
             Server: '10.248.202.25',
             UserId: '',
             Password: '' },
   site: '',
   borderSource: '',
   borderPattern: '',
   borderUserId: '',
   borderPassword: '',
   msgError: '',
   msgDisplay: 'color: darkgreen',
   totalDisplay: 'visibility:hidden',
   credDisplay: 'visibility:hidden',
   srcTotal: 0,
   dstTotal: 0,
   
   toHtml: function(dataStr){
      var html = '<ul>', srcStack = dataStr.split('\n'),
          search = new RegExp(this.params.Pattern, 'g');

      if (srcStack.length > 2){
         html += '<li>'+ srcStack[0] +'</li><ul><li>'+ srcStack[1] +'</li><ul>';
         html += '<li>'+ srcStack[2].replace(/(\u000b|\r\u001c)/g, '') +'</li><ul class="destMatch">';
         this.srcTotal++;
      }
      html = this.destToHtml(dataStr, html);
      html = html.replace(search, '<mark>'+ this.params.Pattern +'</mark>');

      return html + '</ul></ul></ul></ul><script>$("#srcCount").html('+ this.srcTotal +');'+
         '$("#dstCount").html('+ this.dstTotal +');</script>';
   },

   destToHtml: function(dataStr, html){
      var fileArr = dataStr.match(/.*DEST.log.*\n/g), msgArr = dataStr.split('DEST.log');

      if (fileArr){
         for(var idx = 0; idx < fileArr.length; idx++){
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
      Object.keys(this).forEach(key => {
         if (typeof(this[key]) === 'string') { this[key] = ''; }
         else if(typeof(this[key]) === 'number') { this[key] = 0; }
      });
      this.credDisplay = 'visibility:hidden';
      this.msgDisplay = 'color: darkgreen';
      this.totalDisplay = 'visibility:hidden';

      Object.keys(this.params).forEach(key => {
         this.params[key] = '';
      });

      this.params.Server = '10.248.202.25';
   }
};
