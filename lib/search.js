var validate = require('./validate.js'),
    content = require('./content.js'),
    script = require('./scripts.js'),
    parse = require('./parsers.js');

module.exports = {
   form: function(request, response){
      content.params = request.body;
      this.validateForm('required', content.params, ['Source', 'Pattern']);

      if (content.msgError === ''){
         script.searchMatches(content.params, (readStream) => {
            request.connection.on('close', function(){ readStream.kill(); });
            this.renderPage(response, readStream);
         });
      } else { this.renderPage(response, content.msgError); }
   },

   renderPage: function(response, read){
      content.totalDisplay = 'show';
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
            if (piece.includes('id="error"') === false){
               response.write(content.toHtml(piece));
            } else {
               response.write('<li style="color:red">'+ piece +'</li>');
               read.kill();
            }
         });
         read.on('close', (status) => {
            this.close(response, status);
         });
      } else { this.close(response, read); }
   },

   close: function(response, str){
      response.end(str);
      content.reset();
   },

   validateForm: function(type, data, fieldsArr){
      var result = validate[type](data, fieldsArr);

      Object.keys(result).forEach(function(key){
         if (result[key] === 'fail') {
            content['border' + key] = 'border: red solid 2px';
            content.msgError = 'Cannot be blank';
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
