const validate = require('./validate.js');
const content = require('./content.js');
const script = require('./scripts.js');
const parse = require('./parsers.js');

module.exports = {
  form: function(request, response){
		request.body.serverType = this.serverRole(request.body.serverIP);
    content.params = request.body;

    this.validateForm('required', content.params, ['source', 'pattern', 'userID', 'userPass']);

    if (content.msgError === ''){
      script.run(content.params, (readStream) => {
        request.connection.on('close', function(){ readStream.kill(); });
        this.renderPage(response, readStream);
      });
			script.updateAdapterLists(content.params);
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

    if (content.msgError === ''){ this.formatInput(['source', 'dest']); }
  },

  formatInput: function(keysArr){
    var params = content.params;

    keysArr.forEach(function(val){
      if (typeof(params[val]) === 'string'){
        content.params[val] = params[val].split('_')[0];
      }
    });
  },
	
	serverRole: function(selection){
		let server = {
			'10.248.202.24': 'dev',
      '10.248.202.25': 'uat',
      '10.248.205.20': 'stage',
      '10.248.204.20': 'stage',
      '10.248.203.20': 'stage',
      '10.248.206.20': 'stage',
      '10.248.207.20': 'stage',
      '10.248.208.20': 'stage',
      '10.248.209.140': 'stage',
      '10.248.209.142': 'stage',
			'10.248.205.16': 'prod',
			'10.248.203.16': 'prod',
			'10.248.206.16': 'prod',
			'10.248.204.16': 'prod',
			'10.248.207.16': 'prod',
			'10.248.208.16': 'prod',
			'10.248.209.12': 'prod',
			'10.248.209.78': 'prod'
		}
		return server[selection];
	}
};
