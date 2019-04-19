module.exports = {
  message: function(rawResultsStream, callBack){
    let partial = '';
    let full = '';
    let delimIdx = 0;
    
    rawResultsStream.stdout.on('data', (raw) => {
      partial += raw;
      
      if (partial.includes('DELIMITER')) {
        delimIdx = partial.lastIndexOf('DELIMITER') + 9;
        full = partial.substring(0, delimIdx);
        partial = partial.substring(delimIdx, partial.length);
        callBack(full);
      } else if (!partial.includes('MSH|')) {
        callBack(partial);
      }
    });
  }
};