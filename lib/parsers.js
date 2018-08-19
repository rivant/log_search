module.exports = {
  corelId: /correlation Id ([A-Z0-9]*) /,
  fileName: /(\/[a-zA-Z0-9\/\._-]*)/,
  msg: /(MSH[\s\S]*)\r\u001c/m,
  
  stream: function(readStream, callBack){
    this.errStream(readStream, (err) => {
      callBack(err);
    });

    this.stdStream(readStream, (segment) => {
      callBack(segment);
    });
  },

  stdStream: function(readStream, callBack){
    var data = '', segment = '', delimIdx = 0;

    readStream.stdout.on('data', (buf) => {
      data += buf;
			
			if (data.includes('stty:')){
				data = data.replace(/stty.*\r\n.*\r\n/, '');
			}

      if (data.includes('DELIMITER')){
        delimIdx = data.lastIndexOf('DELIMITER') + 9;
        segment = data.substring(0, delimIdx);
        data = data.substring(delimIdx, data.length);            
        callBack(segment);
      } else if (data.includes('Unable')){
					callBack(data);
			}
    });
  },

  errStream: function(readStream, callBack){
    var error = '';

    readStream.stderr.on('data', (err) => {
      error += err;
      callBack(error);
    });
  }
};
