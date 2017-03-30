var validate = require('./validate.js'),
    content = require('./content.js'),
    script = require('./scripts.js'),
    parse = require('./parsers.js');

module.exports = {
   form: function(request, response){
      content.params = request.body;
      this.validateForm('required', content.params, ['Source', 'Pattern']);

      if (content.msgError === ''){
         script.processScripts(content.params, (results) => {

            if (typeof(results) !== 'string'){
               request.connection.on('close', function(){ results.kill(); });
               this.process('valid', results, response); console.log(content.srcDropDown());
            } else {
               this.process('error', results, response);
            }

         });
      } else { this.process('error', content.msgError, response); }
   },

   process: function(type, msg, response){
      if (type === 'valid') {
         content.totalDisplay = 'show';
      } else { content.msgDisplay = 'color: red'; }

      response.render('index', content, (err, form) => {
         if (form) {
            response.write(form);
            this[type](msg, response);
         } else {
            response.write(err);
         }
      });
   },

   error: function(str, response){
      response.end(str);
      content.reset();
   },

   valid: function(readStream, response){
      parse.stream(readStream, script.srcObj, function(obj){
         if (typeof(obj) !== 'string'){
            response.write(content.toHtml(obj));
         } else {
            response.write(obj);
         }
      });
      readStream.on('close', function(){
         response.end();
         content.reset();
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
