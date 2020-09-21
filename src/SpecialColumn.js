import moment from 'moment'

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
  var floatVal = parseFloat(value), number, integer, decimal, rgx;

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
  if (cell.getValue() === undefined || cell.getValue() === '') {
    return '';
  }
  if (cell.getData()[cell.getField() + 'Bold'] === 'bold') {
    cell.getElement().style.fontWeight = 'bold';
  }
  if (cell.getData().bold === true) {
    if(cell.getField() === 'nav') {
      cell.getElement().style.fontWeight = 'bold';
    }
  }
  const a = myMoneyFormatter(cell.getValue(), false);
  return a;
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

  var cells = column.getCells();
  cells.forEach((cell, _) => {
    if (cell.getValue() !== undefined) {
      cell.getElement().innerText = myMoneyFormatter(cell.getValue(), showCents);
    }
  });
}

function initialMoneyPercentFormatter(cell, formatterParams, onRendered){
  if (cell.getValue() !== undefined && cell.getValue().toString().includes('%')) {
    return cell.getValue();
  }
  return initialMoneyFormatter(cell, formatterParams, onRendered);
}

function rightClickMoneyPercent(e, column){
  if (column.getCells().length === 0) {
    return;
  }
  const showCentsColumn = column.getCells().map(cell => {
    return cell.getElement().innerText.includes('.')
  });
  let showCents = showCentsColumn.reduce(function (a, b) {
    return a || b;
  }, false)

  var cells = column.getCells();
  cells.forEach((cell, _) => {
    if (cell.getValue() !== undefined) {
      if (!cell.getValue().toString().includes('%')) {
        cell.getElement().innerText = myMoneyFormatter(cell.getValue(), showCents);
      }
    }
  });
}


// date sorting
function myDateSort(a, b) {
  let aDate = a.date ? a.date : a.date_due;
  let bDate = b.date ? b.date : b.date_due;


  if (typeof(a) === 'string') {
    aDate = new Date(a);
  }
  if (typeof(b) === 'string') {
    bDate = new Date(b);
  }

  let firstDay = null;
  if (aDate === undefined) {
    firstDay = "";
  }
  firstDay = moment.utc(aDate).format('L').toString()
  if (firstDay === 'Invalid date') {
    firstDay = "";
  }

  let secondDay = null;
  if (bDate === undefined) {
    secondDay = "";
  }
  secondDay = moment.utc(bDate).format('L').toString()
  if (secondDay === 'Invalid date') {
    secondDay = "";
  }

  if (aDate < bDate) {
    return -1;
  }
  else if (aDate > bDate) {
    return 1;
  }
  else {
    if (a.type === 'NAV') {
      return 1;
    }
    else if (b.type === 'NAV') {
      return -1;
    }
    return 0;
  }
}

// date sorting for cash funds
function myDateSortCash(a, b) {
  let aDate = a.date_sent ? a.date_sent : a.date;
  let bDate = b.date_sent ? b.date_sent : b.date;


  if (typeof(a) === 'string') {
    aDate = new Date(a);
  }
  if (typeof(b) === 'string') {
    bDate = new Date(b);
  }

  let firstDay = null;
  if (aDate === undefined) {
    firstDay = "";
  }
  firstDay = moment.utc(aDate).format('L').toString()
  if (firstDay === 'Invalid date') {
    firstDay = "";
  }

  let secondDay = null;
  if (bDate === undefined) {
    secondDay = "";
  }
  secondDay = moment.utc(bDate).format('L').toString()
  if (secondDay === 'Invalid date') {
    secondDay = "";
  }

  if (aDate < bDate) {
    return -1;
  }
  else if (aDate > bDate) {
    return 1;
  }
  else {
    if (a.type === 'NAV') {
      return 1;
    }
    else if (b.type === 'NAV') {
      return -1;
    }
    return 0;
  }
}

// NAV calculation
function calcNAV(group, investmentID, nav, invest_type) {
  if (group === undefined) {
    return nav;
  }

  if (invest_type === 'cash') {
    group.sort(myDateSortCash);
  }
  else {
    group.sort(myDateSort);
  }
  return group.reduce((accumulator, current) => {
    if (current.type === 'TRANSFER') {
      if (current.to_investment === investmentID) {
        return accumulator + current.amount;
      }
      return accumulator - current.amount; // in from_investment
    }
    if (current.type === 'COMMISH') {
      if (investmentID === current.investment) {
        return accumulator;
      }
      return accumulator - current.amount; // in from_investment
    }
    if (current.type === 'NAV') {
      return current.amount;
    }
    let amount = current.amount !== undefined ? current.amount : current.net_amount;
    if (current.type === 'DISTRIBUTION' || current.type === 'CONTRIBUTION') {
      // amount is negative for type distribution
      if (current.from_investment === investmentID) {
        return accumulator + amount;
      }
      return accumulator - amount;
    }
    return accumulator + amount;
  }, nav);
}

// NAV calculation
// difference is in what to do with NAV!!
function calcPrelimNAV(group, investmentID, nav, invest_type) {
  if (group === undefined) {
    return nav;
  }
  if (invest_type === 'cash') {
    group.sort(myDateSortCash);
  }
  else {
    group.sort(myDateSort);
  }

  return group.reduce((accumulator, current) => {
    if (current.type === 'TRANSFER') {
      if (current.to_investment === investmentID) {
        return accumulator + current.amount;
      }
      return accumulator - current.amount; // in from_investment
    }
    if (current.type === 'COMMISH') {
      if (investmentID === current.investment) {
        return accumulator;
      }
      return accumulator - current.amount; // in from_investment
    }
    if (current.type === 'NAV') {
      return accumulator;
    }
    let amount = current.amount !== undefined ? current.amount : current.net_amount;
    if (current.type === 'DISTRIBUTION' || current.type === 'CONTRIBUTION') {
      // amount is negative for type distribution
      if (current.from_investment === investmentID) {
        return accumulator + amount;
      }
      return accumulator - amount;
    }
    return accumulator + amount;
  }, nav);
}

function calcNetContribute(group, investmentID, nav) {
  if (group === undefined) {
    return nav;
  }
  group.sort(myDateSort);
  return group.reduce((accumulator, current) => {
    if (current.type === 'TRANSFER') {
      if (current.to_investment === investmentID) {
        return accumulator + current.amount;
      }
      return accumulator - current.amount; // in from_investment
    }
    if (current.type === 'NAV' || current.type === 'COMMISH'
        || current.type === 'GAIN' || current.type === 'FEE'
        || current.type === 'DIV') {
      return accumulator;
    }
    let amount = current.amount !== undefined ? current.amount : current.net_amount;
    if (current.type === 'DISTRIBUTION' || current.type === 'CONTRIBUTION') {
      // amount is negative for type distribution
      if (current.from_investment === investmentID) {
        return accumulator + amount;
      }
      return accumulator - amount;
    }
    return accumulator + amount;
  }, nav);
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
  layout: "fitData",
  movableRows: false,
  columnMinWidth:100,
  maxHeight: "650px",
  resizableColumns:false,
  resizableRows:true,
  layoutColumnsOnNewData:true,
  downloadDataFormatter: (data) => data,
  downloadReady: (fileContents, blob) => blob
};

export {copyCol, myMoneyFormatter, initialMoneyFormatter, initialMoneyPercentFormatter,
  rightClickMoneyPercent, rightClickMoney, calcPrelimNAV, calcNetContribute,
  eventsCol, defaultTabulatorSettings, calcNAV, myDateSort};
