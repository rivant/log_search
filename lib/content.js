module.exports = {	
	borderSource: '',
  borderPattern: '',
  borderUserId: '',
  borderPassword: '',
	dstTotal: 0,
  msgError: '',
  msg: '',
  msgDisplay: 'color: darkgreen',
	params: { Source: '',
            Dest: '',
            Pattern: '',
            Start: '',
            End: '',
            Server: '',
            UserId: '',
            Password: '' },   
  site: '',
  srcTotal: 0,
  totalDisplay: 'visibility:hidden',	
	   
  toHtml: function(dataStr){
    var html = '<ul>', delims = dataStr.split('DELIMITER');
    var search = new RegExp(this.escapeRegExp(this.params.Pattern), 'g');
    var srcStack = [];

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
				html += '<li>'+ val[0] +'</li>';  //correlation Id
				html += '<ul><li style="color:blue">'+ val[1] +'</li><li style="color:blue">'+ val[5] +'</li><ul>';  //metadata				 
				html += '<li>'+ val[2].replace(/[\v\x1C]/g, '').trim() +'</li>';  //message

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
    var fileArr = msgStack.match(/\/.*DEST.log[\.]*[APM0-9-]*/g);
		var msgArr = msgStack.split('DEST.log');
    var msg = /(MSH[\s\S]*)\u001c\r/m;
		var timeStamp = /(MESSAGE PROCESSING[\w\s:-]*),/;		

    if (fileArr){
      for (var idx = 0; idx < fileArr.length; idx++){
        var dstFileName = fileArr[idx].split('/').pop();

        html += '<ul class="destMatch"><li style="color:blue">'+ fileArr[idx] +'</li>';

        if (msgArr[idx + 1].includes('dummy') === false && msg.test(msgArr[idx + 1])){
          html += '<li style="color:blue">'+ timeStamp.exec(msgArr[idx + 1])[1] +'</li><ul>';			
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
      if (typeof(this[key]) === 'string') {this[key] = ''; }
      else if (typeof(this[key]) === 'number') { this[key] = 0; }
    });
		
    this.msgDisplay = 'color: darkgreen';
    this.totalDisplay = 'visibility:hidden';

    Object.keys(this.params).forEach(key => {
      this.params[key] = '';
    });
  },

  escapeRegExp: function(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|\s]/g, "\\$&");
  }
};
