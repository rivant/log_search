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
            this.renderPage(readStream, response);
         });
      } else { this.process('error', content.msgError, response); }
   },

   renderPage: function(readStream, response){
      content.totalDisplay = 'show';
      response.render('index', content, (err, form) => {
         if (form) {
            response.write(form);
            this.processSearchResults(readStream, response);
         } else {
            response.end('<li style="color:red">'+ err +'</li>');
         }
      });

      readStream.on('close', function(){
         response.end();
         content.reset();
      });
   },

   processSearchResults: function(readStream, response){
      parse.stream(readStream, (piece) => {
         if (piece.includes('id="error"') === false){
console.log(piece);
            response.write(content.toHtml(piece));
         } else {
            response.end('<li style="color:red">'+ piece +'</li>');
            content.reset();
         }
      });
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
