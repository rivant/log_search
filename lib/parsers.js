module.exports = {
   corelId: /correlation Id ([A-Z0-9]*) /,
   fileName: /(\/[a-zA-Z0-9\/\._-]*)/,
   msg: /(MSH[\s\S]*)\r\u001c/m,
  
   corelIds: function(srcObj){
      var corelIds = [];
      Object.keys(srcObj).forEach(function(key){
         corelIds.push(key);
      })
      return corelIds.join(' ');
   },

   source: function(str, delim, obj){
      var newArr = this.toArray(str, delim);

      newArr.forEach(val => {
         obj[this.corelId.exec(val)[1]] = { [this.fileName.exec(val)[1]]: this.msg.exec(val)[1] };
      });

      return obj;
   },

   partial: function(str, delim, obj){
      var newArr = this.toArray(str, delim),
          newObj = this.toExistObj(newArr, obj);

      newArr.forEach(val => {
         if (this.corelId.test(val) && this.fileName.test(val) && this.msg.test(val)) {
            if (val.includes('dummy')) {
               newObj[this.corelId.exec(val)[1]][this.fileName.exec(val)[1]] = /(dummy.*) \-/.exec(val)[1];
            } else {
               newObj[this.corelId.exec(val)[1]][this.fileName.exec(val)[1]] = this.msg.exec(val)[1];
            }
         }
      });
      
      return newObj;
   },

   toExistObj: function(arr, obj){
      var newObj = {}, id = '';

      arr.forEach(val => {
         if (this.corelId.test(val)) {
            id = this.corelId.exec(val)[1];
            newObj[id] = obj[id];
         }
      });

      return newObj;
   },

   toArray: function(str, delim){
      var newArr = str.split(delim);
      newArr.pop();

      return newArr.filter(val => { return val !== '' });
   },

   stream: function(readStream, srcObj, callBack){
      var obj = {};

      this.errStream(readStream, (err) => {
         callBack('<li style="color: red;">'+ err +'</li>');
      });

      this.stdStream(readStream, (segment) => {
         callBack(this.partial(segment, 'DELIMITER ', srcObj));
      });

   },

   stdStream: function(readStream, callBack){
      var data = '', segment = '', delimIdx = 0;

      readStream.stdout.on('data', (buf) => {
         data += buf;
         if (data.includes('DELIMITER ')){
            delimIdx = data.indexOf('DELIMITER ') + 10;
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
