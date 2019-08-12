(function() {
content = {
  srcMsgCount: 0,
  dstMsgCount: 0,
  ackIndicator: 'color:red',
	   
  toHtml: function(dataStr, searchedPattern){
    let html = '';
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
    let response = /.*(RESPONSE SENT.*)/;
    let ack = /.*(MSA\|.*)/;
    let flattened = val.toString();

    if (val.length > 2){
      if (val[0] === '' || val[0] === '\r'){ val.shift(); }

      html += '<ul><li>'+ val[0] +'</li>';  //correlation Id
      html += '<ul><li style="color:blue">'+ val[1] +'</li><li style="color:blue">'+ val[5].split('  -')[1] +'</li>';  //metadata
      html += '<ul><li>'+ val[2].replace(/[\v\x1C]/g, '').trim() +'</li></ul>';  //message

      if (ack.test(flattened)) {
        if (flattened.includes('MSA|AA')) {
          this.ackIndicator = 'color:blue';
        }
        html += '<li style="'+ this.ackIndicator +'">'+ ack.exec(flattened) +'</li>';
      }
      if (response.test(flattened)) {
        html += '<li style="'+ this.ackIndicator +'">'+ response.exec(flattened)[1] +'</li>';
      }

      this.srcMsgCount++

      if (val.toString().includes('DEST.log')){
        html += '<hr>';
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
    let msa = /INFO[\s\S]*(MSA\|A.*)/;
    let ack = /INFO[\s\S]*(POSITIVE.*|NACK A.*)/;
    let fileNameDst = [];

    if (fileArr){
      for (let idx = 0; idx < fileArr.length; idx++){
        html += '<ul class="destMatch"><li style="color:blue">'+ fileArr[idx] +'</li>';

        if (msgArr[idx + 1].includes('dummy') === false && msg.test(msgArr[idx + 1])){
          if (timeStamp.test(msgArr[idx + 1])) {
            html += '<li style="color:blue">'+ timeStamp.exec(msgArr[idx + 1])[1] +'</li><ul>';
          }

          html += '<li>'+ msg.exec(msgArr[idx + 1])[1] +'</li></ul>';

          if (msa.test(msgArr[idx + 1]) && ack.test(msgArr[idx + 1])) {
            if (msa.exec(msgArr[idx + 1])[1].includes('MSA|AA')) {
              this.ackIndicator = 'color:blue';
            } else {
              this.ackIndicator = 'color:red';
            }
            html += '<li style="'+ this.ackIndicator +'">'+ msa.exec(msgArr[idx + 1])[1] +'</li>';
            html += '<li style="'+ this.ackIndicator +'">'+ ack.exec(msgArr[idx + 1])[1] +'</li>';
          }

          html += '</ul><br>';
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