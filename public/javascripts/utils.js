function uniqueArray(arr) {
	for(var i = 0; i < arr.length; ++i) {
		for(var j = i + 1; j < arr.length; ++j) {
			if(arr[i] === arr[j])
				arr.splice(j--, 1);
		}
	}
	return arr;
}

function today(){
  let date = new Date();
  let mm = date.getMonth() + 1;
  let dd = date.getDate();

  return [date.getFullYear(), '-',
      (mm>9 ? '' : '0') + mm, '-',
      (dd>9 ? '' : '0') + dd
    ].join('');
}

serverRole = {
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

function randomPortNumber() {
  return Math.floor(Math.random() * (65000 - 60000 + 1)) + 60000;
}