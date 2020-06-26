import React, {useState, useEffect, useRef} from "react";
import ReactDOM from "react-dom";
import Tabulator from "tabulator-tables"; //import Tabulator library


import 'tabulator-tables/dist/css/tabulator.min.css';
import 'font-awesome/css/font-awesome.min.css';

import {copyCol} from './SpecialColumn';

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const defaultTabulatorSettings = {
  movableRows: true,
  columnMinWidth:100,
  resizableColumns:false,
  resizableRows:true,
  layoutColumnsOnNewData:true,
};

// // a column that when clicked launches the events page
const eventsCol = {
  formatter:function(cell, formatterParams, onRendered){ //plain text value
     return "<i class='fa fa-etsy' aria-hidden='true'></i>";
 }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
   ViewEvents(cell.getRow().getData());
}};

// a column that when clicked launches the transactions page
const transactionsCol = {
  formatter:function(cell, formatterParams, onRendered){ //plain text value
     return "<i class='fa fa-tumblr'></i>";
   }, minWidth: 40, width:40, headerSort:false,
   responsive:0, hozAlign:"center", cellClick:function(e, cell){
      ViewTransfers(cell.getRow().getData());
    }
};

const textColumns = ['Management Fee',	'Preferred Return',	'Carried Interest',
                     'Sponsor Investment',	'Notes'];
const currencyColumns = ['Commitment',	'Size (M)'];

// my special money formatter
function myMoney(value, showCents) {
  var floatVal = parseFloat(value), number, integer, decimal, rgx;

  var decimalSym = ".";
  var thousandSym = ",";
  var symbol = "$";
  var precision = showCents ? 0 : 2;

  number = precision !== false ? floatVal.toFixed(precision) : floatVal;
  number = String(number).split(".");

  integer = number[0];
  decimal = number.length > 1 ? decimalSym + number[1] : "";

  rgx = /(\d+)(\d{3})/;

  while (rgx.test(integer)) {
    integer = integer.replace(rgx, "$1" + thousandSym + "$2");
  }

  return symbol + integer + decimal;
};

function ViewEvents(props) {
 ipcRenderer.send('viewEvents', props);
};

function ViewTransfers(props) {
  ipcRenderer.send('viewTransfers', props);
};


const renderTable = function renderTable(tableName, element) {
  return (<div>
            <div className="w3-show-inline-block" style= {{width: "100%"}}>
                <br />
                <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
                <br />
                <br />
            </div>
            <div id={tableName} ref={element}/>
            <br />
          </div>);
};

// dataFormator
const reformulateData = function reformulateData(data) {
  const keys = Object.keys(data);
  const maxLength = Math.max(...keys.map( (key) => {
      return data[key].length;
  }));
  var newDataArr = [];

  var i;
  for (i = 0; i < maxLength; i++) {
    var element = {};
    var key;
    for (key of keys) {
      if (i <= data[key].length) {
          element[key] = data[key][i];
      }
      else {

        element[key] = "";
      }
    }
    newDataArr.push(element);
  }
  return newDataArr;
};


// table class
const InvestmentTable = (props) => {
  const [tableData, setTableData] = useState(reformulateData(props.data));
  const [tableDataOriginal, setTableDataOriginal] = useState(props.data);
  const [tableName, setTableName] = useState(props.name);

  const el = useRef();
  const [tabulator, setTabulator] = useState(null); //variable to hold your table

  // tableData = reformulateData(AccountData); //data for table to display
  useEffect(() => {
    const columnNames = Object.keys(tableDataOriginal);
    let colNames = columnNames.map((colName) => {
      if (colName == 'Commitment? (Y/N)') {
        return {title:colName, field:colName,
          formatter:"tickCross", formatterParams:{
              allowEmpty:false,
              allowTruthy:true,
              tickElement:"<i class='fa fa-check'></i>",
              crossElement:"<i class='fa fa-times'></i>",
        }};
      }
      else if (textColumns.includes(colName)) {
        return {title: colName, field: colName, responsive: 0,
                formatter:"textarea",  formatterParams:{
                    elementAttributes:{
                        maxLength:"300", //set the maximum character length of the textarea element to 10 characters
                    }
            }, variableHeight:true, headerSort:false,
            minWidth: 300, width: 350, resizable:true};
      }
      else if (currencyColumns.includes(colName)) {
        return {title: colName +' $',
          field: colName, responsive: 0, minWidth: 80,
          formatter: "money", formatterParams:{
            decimal:".",
            thousand:",",
            symbol:"$",
            precision:0,
          }, headerTooltip: 'Right Click to toggle cents',
          headerContext:function(e, column){
            const showCents = column.getElement().getElementsByClassName('tabulator-col-title')[0].innerText.includes('$');
            const currSymbol = showCents ? ' ¢' : ' $';
            column.getElement().getElementsByClassName('tabulator-col-title')[0].innerText  = colName + currSymbol;

            var cells = column.getCells();
            cells.forEach((cell, _) => {
              cell.getElement().innerText = myMoney(cell.getValue(), !showCents);
            });

          }};
      }
      return {title: colName, field: colName, responsive: 0};
    });

    //instantiate Tabulator when element is mounted
    const newTabulator = new Tabulator(el.current, {
       ...defaultTabulatorSettings,
       layout: "fitColumns",
       data: tableData, //link data to table
       columns: [
        copyCol,
        eventsCol,
        transactionsCol,
        ...colNames
        ]//define table columns
    });
    setTabulator(newTabulator);
  }, []); // add max length vars here if immediately refresh

  //add table holder element to DOM
  return renderTable(tableName, el);
};

export default InvestmentTable;
