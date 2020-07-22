const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

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

// my special money formatter
function myMoneyFormatter(value, showCents) {
  let myFloat = value;
  try {
    myFloat = value.substring(1)
  }
  catch {
    showCents = !showCents;
  }
  var floatVal = parseFloat(myFloat), number, integer, decimal, rgx;

  var decimalSym = ".";
  var thousandSym = ",";
  var symbol = "$";
  var precision = showCents ? 0 : 2;

  number = floatVal.toFixed(precision);
  number = String(number).split(".");

  integer = number[0];
  let sign = '';
  if (floatVal < 0) {
    integer = integer.substring(1);
    sign = '-';
  }

  decimal = number.length > 1 ? decimalSym + number[1] : "";

  rgx = /(\d+)(\d{3})/;

  while (rgx.test(integer)) {
    integer = integer.replace(rgx, "$1" + thousandSym + "$2");
  }

  return sign + symbol + integer + decimal;
};

function initialMoneyFormatter(cell, formatterParams, onRendered){
  if (cell.getValue() === undefined) {
    return '';
  }
  return myMoneyFormatter(cell.getValue(), true);
}

function rightClickMoney(e, column){
  if (column.getCells().length === 0) {
    return;
  }
  const showCentsColumn = column.getCells().map(cell => {
    return cell.getElement().innerText.includes('.')
  });
  let showCents = showCentsColumn.reduce(function (a, b) {
    return a || b;
  }, false)
  showCents = !showCents;

  var cells = column.getCells();
  cells.forEach((cell, _) => {
    if (cell.getValue() !== undefined) {
      cell.getElement().innerText = myMoneyFormatter(cell.getValue(), showCents);
    }
  });
}

// // a column that when clicked launches the events page
const eventsCol = {
  formatter:function(cell, formatterParams, onRendered){ //plain text value
     return "<i class='fa fa-etsy' aria-hidden='true'></i>";
 }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
   ipcRenderer.send('viewEvents', cell.getRow().getData());
   // ViewEvents(cell.getRow().getData());
}};

// settings I use across tables
const defaultTabulatorSettings = {
  movableRows: true,
  columnMinWidth:100,
  resizableColumns:false,
  resizableRows:true,
  layoutColumnsOnNewData:true,
};

export {copyCol, myMoneyFormatter, initialMoneyFormatter, rightClickMoney,
  eventsCol, defaultTabulatorSettings};
