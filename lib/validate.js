module.exports = {
  required: function(data, keys){
     var keyStatus = {};

    keys.forEach(function(key){
			keyStatus[key] = data[key] === '' ? 'fail' : 'pass';
    });

    return keyStatus;
  }
};
