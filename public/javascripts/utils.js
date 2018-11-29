function uniqueArray(arr) {
  for(let i = 0; i < arr.length; ++i) {
    for(let j = i + 1; j < arr.length; ++j) {
      if(arr[i] === arr[j])
	arr.splice(j--, 1);
    }
  }
  return arr;
}

function checkAdapterLocation(form){
  let role = serverRole[form.serverIP.value];
  let src = form.source.value;
  let dst = form.dest.value;
  form.remote.value = (srcObj[src +'_'+ role] === dstObj[dst +'_'+ role]) ? 'undefined' : dstObj[dst +'_'+ role];
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
