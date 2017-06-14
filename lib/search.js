var validate = require('./validate.js'),
    content = require('./content.js'),
    script = require('./scripts.js'),
    parse = require('./parsers.js');

module.exports = {
   srcFileCompare: '',
   dstFileCompare: [],

   form: function(request, response){
      content.params = request.body;
      this.validateForm('required', content.params, this.ServerCheck());

      if (content.msgError === ''){
         script.run(content.site, content.params, (readStream) => {
            request.connection.on('close', function(){ readStream.kill(); });
            this.renderPage(response, readStream);
         });
      } else { this.renderPage(response, content.msgError); }
   },

   renderPage: function(response, read){
      content.totalDisplay = 'visibility:visible';
      response.render('index', content, (err, form) => {
         if (form) {
            response.write(form);
            this.processSearchResults(response, read);
         } else {
            response.end('<li style="color:red">'+ err +'</li>');
         }
      });
   },

   processSearchResults: function(response, read){		
      if (typeof(read) !== 'string'){
         parse.stream(read, (piece) => {
            if (piece.includes('Cannot') === false){
               response.write(content.toHtml(piece));
               if (content.site === 'Remote'){ this.sendFile() };
            } else {
               response.write('<li id="error" style="color:red">'+ piece +'</li>');
               read.kill();
            }
         });
         read.on('close', () => {
            this.close(response, '');
         });
      } else { this.close(response, read); }
   },

   sendFile: function(){
      if (content.fileNameSrc !== this.srcFileCompare){
         this.srcFileCompare = content.fileNameSrc;
         script.copyRemote('SOURCE', content.params, (ack) => {
            console.log(ack.pid);         
         });
      }
      if (content.fileNameDst.toString() !== this.dstFileCompare.toString()){
         this.dstFileCompare = content.fileNameDst;
         script.copyRemote('DEST', content.params, (ack) => {
            console.log(ack.pid);         
         });
      }
   },

   close: function(response, msg){
      if (typeof(msg) !== 'string'){
         msg = msg.toString();
      }		
      response.end(msg);
      content.reset();
		this.srcFileCompare = '';
		this.dstFileCompare = [];
   },

   ServerCheck: function(){
      var  fieldsArr = [];
      if (content.params.Server === '10.248.202.25'){
         fieldsArr = ['Source', 'Pattern'];
         content.site = 'Local';
      } else {
         content.credDisplay = 'visibility:visible';
         fieldsArr = ['Source', 'Pattern', 'UserId', 'Password'];
         content.site = 'Remote';
      }
         
      return fieldsArr;
   },

   validateForm: function(type, data, fieldsArr){
      var result = validate[type](data, fieldsArr);

      Object.keys(result).forEach(function(key){
         if (result[key] === 'fail') {
            content['border' + key] = 'border: red solid 2px';
            content.msgError = 'Red field(s) are required';
            content.msgDisplay = 'color: red';
         }
      });
      if (content.msgError === ''){
         this.formatInput(['Source', 'Dest']);
      }
   },

   formatInput: function(keysArr){
      var params = content.params;

      keysArr.forEach(function(val){
         if (typeof(params[val]) === 'string'){
            content.params[val] = params[val].split('_')[0].toUpperCase();
         }
      });
   }
};
