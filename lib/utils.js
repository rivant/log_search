module.exports = {
   truncate: function(str, divider){
      var piece = str.split(divider);
      return piece[0];
   },
   
   today: function(){
     var date = new Date(),
          mm = date.getMonth() + 1,
          dd = date.getDate();

      return [date.getFullYear(), '-',
          (mm>9 ? '' : '0') + mm, '-',
          (dd>9 ? '' : '0') + dd
         ].join('');
   },

   dateRange: function(start, end){
      var startDateFormat = start.slice(5,10) + '-' + start.slice(0,4),
          endDateFormat = end.slice(5,10) + '-' + end.slice(0,4),
          startDate = new Date(startDateFormat),
          endDate = new Date(endDateFormat),
          startNumber = Math.ceil((Date.now() - startDate.getTime()) / (1000*3600*24)),
          endNumber = Math.floor((Date.now() - endDate.getTime()) / (1000*3600*24));
      return { end: endNumber, start: startNumber };
   }
};
