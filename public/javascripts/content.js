(function() {
content = {  
  srcMsgCount: 0,
  dstMsgCount: 0,
	   
  toHtml: function(dataStr, searchedPattern){
    let html = '<ul>'
    let delims = dataStr.split('DELIMITER');
    let search = new RegExp(this.escapeRegExp(searchedPattern), 'g');
    let srcStack = [];

    delims.forEach(function(val){ srcStack.push(val.split('\n')); });

    srcStack.forEach( (val) => {
      html = this.srcToHtml(val, html);
    });

    html = html.replace(search, '<mark>'+ searchedPattern +'</mark>');

    return html + '</ul>';
   },

  srcToHtml: function(val, html){		
    if (val.length > 2){
      if (val[0] === '' || val[0] === '\r'){ val.shift(); }
      
      html += '<li>'+ val[0] +'</li>';  //correlation Id
      html += '<ul><li style="color:blue">'+ val[1] +'</li><li style="color:blue">'+ val[5] +'</li><ul>';  //metadata				 
      html += '<li>'+ val[2].replace(/[\v\x1C]/g, '').trim() +'</li>';  //message
      this.srcMsgCount++
	
      if (val.toString().includes('DEST.log')){
        html = this.destToHtml(val.toString(), html);				
      } else {
        html += '</ul></ul><br/>';			
      }
    }
    return html;
  },

  destToHtml: function(msgStack, html){
    let fileArr = msgStack.match(/\/.*DEST.log[\.]*[APM0-9-]*/g);
    let msgArr = msgStack.split('DEST.log');
    let msg = /(MSH[\s\S]*)(\u001c\r|\u0003)/m;
    let timeStamp = /(MESSAGE PROCESSING[\w\s:-]*),/;
    let ack = /INFO[\s\S]*(POSITIVE.*|NACK.*)/;
    let fileNameDst = [];

    if (fileArr){
      for (let idx = 0; idx < fileArr.length; idx++){
        html += '<ul class="destMatch"><li style="color:blue">'+ fileArr[idx] +'</li>';

        if (msgArr[idx + 1].includes('dummy') === false && msg.test(msgArr[idx + 1])){
          if (timeStamp.test(msgArr[idx + 1])) {
            html += '<li style="color:blue">'+ timeStamp.exec(msgArr[idx + 1])[1] +'</li><ul>';
          }          
          html += '<li>'+ msg.exec(msgArr[idx + 1])[1] +'</li></ul>';
          if (ack.test(msgArr[idx + 1])) {
            html += '<li style="color:blue">'+ ack.exec(msgArr[idx + 1])[1] +'</li></ul><br>';
          }
        } else if (/dummy.*/.test(msgArr[idx + 1])) {
            html += '<ul><li>'+ /dummy.*/.exec(msgArr[idx + 1])[0] +'</li><br></ul></ul>';
        } else { html += '</ul></ul>'; }
            this.dstMsgCount++;;
      }
    }
    return html + '</ul></ul><br/>';
  },

  escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\s]/g, "\\$&");
  }
}
})();