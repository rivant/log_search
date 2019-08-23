function validateSearch(address, port) {
  const validate = {
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
        const element = document.getElementById(key.id)
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
      const start = new Date(this.startDate.value)
      const end = new Date(document.getElementById('endDate').value)
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

  document.getElementById('submit').addEventListener('click', function() {
    if (validate.all()){
      const ipAddress = document.getElementById('server_select').value;
      const sourceAdapter = document.getElementById('source').value;
      const destAdapter = document.getElementById('dest').value;
      const role = serverRole[ipAddress];
      const ws = new WebSocket('wss://' + address + ':' + port);
      const indicator = document.getElementById('loader');
      let searchFor = {};

      if (destAdapter === ''){
        document.getElementById('destAdapterLocation').value = 'empty';
      } else {
        document.getElementById('destAdapterLocation').value = (srcAdapterObject[sourceAdapter +'_'+ role] === dstAdapterObject[destAdapter +'_'+ role]) ? 
        'empty' : document.getElementById('userID').value +'_'+ dstAdapterObject[destAdapter +'_'+ role] +'_'+ randomPortNumber();
      }
      
      document.getElementById('serverRole').value = role;

      const searchForm = document.getElementsByClassName('search-form');
      for (let i = 0; i < searchForm.length; i++){ searchFor[searchForm.item(i).name] = searchForm.item(i).value; }
      const msgTotals = document.getElementsByClassName('totals');
      for (let i = 0; i < msgTotals.length; i++) { msgTotals.item(i).innerHTML = ''; }
      document.getElementById('msgDisplay').innerHTML = '';

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

          document.getElementById('msgDisplay').insertAdjacentHTML('beforeend', content.toHtml(fullMsg, searchFor.pattern.replace(/'/g, '')));
          document.getElementById('srcCount').innerHTML = content.srcMsgCount;
          document.getElementById('dstCount').innerHTML = content.dstMsgCount;
        } else if (!partialMsg.includes('MSH|')) {
            document.getElementById('msgDisplay').insertAdjacentHTML('beforeend', '<span style="color:red">'+ partialMsg +'</span>');
        }
      }

      ws.onclose = (closeEvent) => {
        indicator.setAttribute('style', 'visibility:hidden');
        content.srcMsgCount = 0;
        content.dstMsgCount = 0;
      }

      document.getElementById('counter').setAttribute('style', 'visibility:visible');
      indicator.setAttribute('style', 'visibility:visible');
      indicator.addEventListener('click', () => { ws.close(); })
    }
  })
}