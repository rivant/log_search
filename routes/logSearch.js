const script = require('../lib/scripts')

function logSearch(ws, searchParams) {
  let destination = searchParams.dest.split('_')
  searchParams.source = searchParams.source.split('_')[0]
  searchParams.dest = destination[0] === '' ? 'empty' : destination[0]

  script.searchLogs(searchParams, (rawResultsStream) => {
    if (rawResultsStream) {
      rawResultsStream.stdout.on('data', (msg) => {   
        if (ws) {
          ws.send(msg.toString())
        }       
      })
      
      rawResultsStream.stdout.on('error', (err) => {
        ws.send(err)
      })

      rawResultsStream.on('close', () => {
        ws.close()
      })

      ws.on('close', () => {
        rawResultsStream.kill()
      })
    } 
  })
}

module.exports = logSearch;