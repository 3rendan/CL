const copyCol = {
  formatter:function(cell, formatterParams, onRendered){ //plain text value
     return "<i class='fa fa-clipboard'></i>";
   }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
  const myText = cell.getRow().getData();

  // get the values
  const values = Object.keys(myText).map(function(key){
      return myText[key];
  });

  let valuesExcel = values.reduce(function(a, b) {
      return a + '\t' + b;
  });

  function ascii_to_hexa(str, n)
  {
    	var hex = Number(str.charCodeAt(n)).toString(16);
      // console.log(hex + ' ' + str.charAt(n))
      if (['a', 'b', 'c', 'd'].includes(hex)) {
        return '\\n';
      }
      else {
        return str.charAt(n);
      }
   }

  let valuesClipboard = '';
  var i;
  for (i = 0; i < valuesExcel.length; i++) {
    valuesClipboard += ascii_to_hexa(valuesExcel, i);
  }
  console.log(valuesClipboard)


  // copy to clipboard
  navigator.clipboard.writeText(valuesClipboard).then(() => console.log('successs')).catch((e) => console.log(e));
  document.execCommand("copy");
}};

export {copyCol};
