const validate = require('./validate.js');
const content = require('./content.js');
const script = require('./scripts.js');
const parse = require('./parsers.js');

module.exports = {
  form: function(request, response){
    content.params = request.body;

    // Create temporary key to hold encryption key value
    content.params.tempKey = Date.now();
		
    this.validateForm('required', content.params, ['Source', 'Pattern', 'UserId', 'Password']);

    if (content.msgError === ''){
      script.run(content.params, (readStream) => {
        request.connection.on('close', function(){ readStream.kill(); });
        this.renderPage(response, readStream);
      });
      script.updateAdapterLists();
    } else { this.renderPage(response, content.msgError); }
  },

  renderPage: function(response, read){
    content.totalDisplay = 'visibility: visible';
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
      parse.stream(read, (partial) => {
        if (partial.includes('Unable') === false){
          response.write(content.toHtml(partial));
        } else {
            response.write('<li id="error" style="color:red">'+ partial +'</li>');
            read.kill();
        }
      });
      read.on('close', () => {
        this.close(response, '');
        delete content.params.tempKey;
        delete process.env.tempKey;
      });
    } else { this.close(response, read); }
  },

  close: function(response, msg){
    if (typeof(msg) !== 'string'){ msg = msg.toString(); }

    response.end(msg);
    content.reset();
  },

  validateForm: function(type, data, checkFieldsArr){
    var result = validate[type](data, checkFieldsArr);

    Object.keys(result).forEach(function(key){
      if (result[key] === 'fail') {
        content['border' + key] = 'border: red solid 2px';
        content.msgError = 'Red field(s) are required';
        content.msgDisplay = 'color: red';
      }
    });

    if (content.msgError === ''){ this.formatInput(['Source', 'Dest']); }
  },

  formatInput: function(keysArr){
    var params = content.params;

    keysArr.forEach(function(val){
      if (typeof(params[val]) === 'string'){
        content.params[val] = params[val].split('_')[0];
      }
    });
  }
};
