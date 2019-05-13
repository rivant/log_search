function validateSearch(address, port) {
  let validate = {
    requiredPass: true,
    datesPass: true,
    requiredSet: document.querySelectorAll('[required]'),
    startDate: document.getElementById('startDate'),
    all: function() {
      this.required()
      this.dates()
      return this.requiredPass && this.datesPass ? true : false
    },
    required: function() {
      this.requiredPass = true;
      this.requiredSet.forEach((key) => {
        let element = document.getElementById(key.id)
        if (key.value === ''){          
          element.classList.add('error-box')
          element.setAttribute('placeholder', 'Required Field')
          this.requiredPass = false;
        } else {
          element.classList.remove('error-box')
          element.removeAttribute('placeholder', 'Required Field')
        }
      })
    },
    dates: function() {
      let start = new Date(this.startDate.value)
      let end = new Date(document.getElementById('endDate').value)
      this.datesPass = true
      
      if (start > end){
        this.startDate.classList.add('error-box')
        document.getElementById('compError').classList.remove('hide')
        this.datesPass = false
      } else {
        this.startDate.classList.remove('error-box')
        document.getElementById('compError').classList.add('hide')
      }
    }    
  }

  $('#submit').on('click', function(){ 
    if (validate.all()){
      let searchFor = {}      
      let ipAddress = document.getElementById('server_select').value;
      let sourceAdapter = document.getElementById('source').value;
      let destAdapter = document.getElementById('dest').value;
      let role = serverRole[ipAddress];
      let ws = new WebSocket('wss://' + address + ':' + port)

      document.getElementById('destAdapterLocation').value = (srcObj[sourceAdapter +'_'+ role] === dstObj[destAdapter +'_'+ role] && destAdapter !== '') ? 
        'empty' : document.getElementById('userID').value +'_'+ dstObj[destAdapter +'_'+ role] +'_'+ randomPortNumber();
  
      $('.search-form').map(function(){ searchFor[this.name] = this.value })
      $('.totals').text('')
      $('#msgDisplay').text('')          

      ws.onopen = (event) => {
        ws.send(JSON.stringify(searchFor));
      }

      let partialMsg = '';
      let fullMsg = '';
      let msgDelimiterIdx = 0;
      ws.onmessage = (chunk) => {
        partialMsg += chunk.data;
        
        if (partialMsg.includes('DELIMITER')) {
          msgDelimiterIdx = partialMsg.lastIndexOf('DELIMITER') + 9;
          fullMsg = partialMsg.substring(0, msgDelimiterIdx);
          partialMsg = partialMsg.substring(msgDelimiterIdx, partialMsg.length);

          $(content.toHtml(fullMsg, searchFor.pattern.replace(/'/g, ''))).appendTo('#msgDisplay');
          document.getElementById('srcCount').innerHTML = content.srcMsgCount;
          document.getElementById('dstCount').innerHTML = content.dstMsgCount;
        } else if (!partialMsg.includes('MSH|')) {
            $('<span style="color:red">'+ partialMsg +'</span>').appendTo('#msgDisplay');
        }
      }

      ws.onclose = (closeEvent) => {
        $('#loader').css({'visibility': 'hidden'})
        content.srcMsgCount = 0
        content.dstMsgCount = 0
      }

      $('#counter').css({'visibility': 'visible'})
      $('#loader').css({'visibility': 'visible'}).on('click', function(){
        ws.close()
      })
    }
  })
}