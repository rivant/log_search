const script = require('../lib/scripts')
const parse = require('../lib/parsers')

function logSearch(ws, searchParams) {
  let destination = searchParams.dest.split('_')
  searchParams.source = searchParams.source.split('_')[0]
  searchParams.dest = destination[0] === '' ? 'empty' : destination[0]

  script.searchLogs(searchParams, (rawResultsStream) => {
    if (rawResultsStream) {
      parse.message(rawResultsStream, (segment) => {
          ws.send(segment)
      })
      
      rawResultsStream.stdout.on('error', (raw) => {
        ws.send(raw)
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