module.exports = {
   corelId: /correlation Id ([A-Z0-9]*) /,
   fileName: /(\/[a-zA-Z0-9\/\._-]*)/,
   msg: /(MSH[\s\S]*)\r\u001c/m,
  
   stream: function(readStream, callBack){
      var obj = {};

      this.errStream(readStream, (err) => {
         callBack('<li id="error" style="color: red;">'+ err +'</li>');
      });

      this.stdStream(readStream, (segment) => {
         callBack(segment);
      });
      console.log(readStream.pid);
   },

   stdStream: function(readStream, callBack){
      var data = '', segment = '', delimIdx = 0;

      readStream.stdout.on('data', (buf) => {
         data += buf;
         if (data.includes('DELIMITER')){
            delimIdx = data.indexOf('DELIMITER') + 10;
            segment = data.substring(0, delimIdx);
            data = data.substring(delimIdx, data.length);
            
            callBack(segment);
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
}
