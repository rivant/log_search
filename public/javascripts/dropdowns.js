function adapterLists(srcArr, dstArr) {
	var srcAdapter = /[A-Z0-9]*_.*SOURCE/, region = /REGION\/([A-Z0-9]*)\//, dstAdapter = /[A-Z0-9]*_.*DEST/;
	var sources = [];
	destinations = [];
	
	srcArr.forEach( (val) => {
    if (region.test(val) && srcAdapter.test(val)){
      sources.push({ label: srcAdapter.exec(val)[0], category: region.exec(val)[1] });
    }
  });
  dstArr.forEach( (val) => {
    if (region.test(val) && dstAdapter.test(val)){
      destinations.push({ label: dstAdapter.exec(val)[0], category: region.exec(val)[1] });
     }
    });

  $.widget( "custom.catcomplete", $.ui.autocomplete, {
    _create: function() {
      this._super();
      this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
    },
    _renderMenu: function( ul, items ) {
      var that = this,
        currentCategory = "";
      $.each( items, function( index, item ) {
        var li;
        if ( item.category != currentCategory ) {
          ul.append( "<li class='ui-autocomplete-category'>" + item.category + "</li>" );
          currentCategory = item.category;
        }
        li = that._renderItemData( ul, item );
        if ( item.category ) {
          li.attr( "aria-label", item.category + " : " + item.label );
        }
      });
    }
  });
	
   $( "#source" ).catcomplete({
      delay: 0,
      source: sources
   });
   $( "#dest" ).catcomplete({
      delay: 0,
      source: destinations
   });
}
