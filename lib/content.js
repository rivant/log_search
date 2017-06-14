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
   msg: '',
   msgDisplay: 'color: darkgreen',
   totalDisplay: 'visibility:hidden',
   credDisplay: 'visibility:hidden',
   srcTotal: 0,
   dstTotal: 0,
   fileNameSrc: '',
   fileNameDst: [],
   
   toHtml: function(dataStr){
      var html = '<ul>', delims = dataStr.split('DELIMITER'),
          search = new RegExp(this.escapeRegExp(this.params.Pattern), 'g'),
          srcStack = [];

      delims.forEach(function(val){ srcStack.push(val.split('\n')); });

      srcStack.forEach( (val) => {
         html = this.srcToHtml(val, html);
      });

      html = html.replace(search, '<mark>'+ this.params.Pattern +'</mark>');

      return html + '</ul><script>$("#srcCount").html('+ this.srcTotal +');'+
         '$("#dstCount").html('+ this.dstTotal +');</script>';
   },

   srcToHtml: function(val, html){		
      if (val.length > 2){
         if (val[0] === '' || val[0] === '\r'){ val.shift(); }
         this.fileNameSrc = val[1].split('/').pop();

         html += '<li>'+ val[0] +'</li>';
         html += '<ul><li><a href="'+ this.fileNameSrc +'">'+ val[1] +'</a></li><li>'+ val[5] +'</li><ul>';
         html += '<li>'+ val[2].replace(/(\u000b|\r\u001c)/g, '').trim() +'</li>';
         this.srcTotal++;
         if (val.toString().includes('DEST.log')){
            html = this.destToHtml(val.toString(), html);				
         } else {
	    html += '</ul></ul><br/>';				
	}
      }
      return html;
   },

   destToHtml: function(msgStack, html){
      var fileArr = msgStack.match(/\/.*DEST.log[\.]*[APM0-9-]*/g), msgArr = msgStack.split('DEST.log'),
          msg = /(MSH[\s\S]*)\r\u001c/m, timeStamp = /.*(message.*DFDA for[\.0-9\s\w-:]*,[0-9]*).*/;			 

      this.fileNameDst = [];
      if (fileArr){
         for(var idx = 0; idx < fileArr.length; idx++){
            var dstFileName = fileArr[idx].split('/').pop();
            this.fileNameDst.push(dstFileName);

            html += '<ul class="destMatch"><li><a href="'+ dstFileName +'">'+ fileArr[idx] +'</a></li>';
            if (msgArr[idx + 1].includes('dummy') === false && msg.test(msgArr[idx + 1])){
               html += '<li>'+ timeStamp.exec(msgArr[idx + 1])[1] +'</li><ul>';
               html += '<li>'+ msg.exec(msgArr[idx + 1])[1] +'</li></ul></ul>';
            } else if (/dummy.*/.test(msgArr[idx + 1])) {
               html += '<ul><li>'+ /dummy.*/.exec(msgArr[idx + 1])[0] +'</li></ul></ul>';
            } else { html += '</ul></ul>'; }
            this.dstTotal++;
         }
      }
      return html + '</ul></ul><br/>';
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
   },

   escapeRegExp: function(str) {
      return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
   }
};
