requested = {
  sourceArray: [],
	sourceObject: {},
  destArray: [],
  destObject: {},
  sourceList: fetch('https://10.248.202.25:17701/srclist').then(response => {
    response.text().then(text => {
      requested.format('source', text); 
    })
  }),
  destList: fetch('https://10.248.202.25:17701/dstlist').then(response => {
    response.text().then(text => {
      requested.format('dest', text);  
    })
  }),
  format: ((type, text) => {
    let lines = text.split('\r\n');
    lines.forEach(line => {
      let item = line.split(' ');
      requested[type + 'Array'].push(item[0]);
      requested[type + 'Object'][item[0] +'_'+ item[1]] = item[2];
    })
  })
}