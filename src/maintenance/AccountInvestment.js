import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Tabulator from "tabulator-tables"; //import Tabulator library

import {copyCol} from '../SpecialColumn';

import {
  AccountData, InvestmentData, OwnerData, AssetClassData, BenchmarkData
} from '../Data';

// const BrowserWindow = require('electron').remote.BrowserWindow;
const path = require('path');
const url = require('url');

function AddRow(data, tabulator, setIsTrue) {
  return function() {
      if (setIsTrue != null) {
        setIsTrue(false);
      };

      data.push({});
      console.log('ADDED NEW ROW');
      tabulator.replaceData(data);
  }
};


// my special money formatter
function myMoney(value, showCents) {
  var floatVal = parseFloat(value), number, integer, decimal, rgx;

  var decimalSym = ".";
  var thousandSym = ",";
  var symbol = "$";
  var after = after;
  var precision = showCents ? 0 : 2;

  number = precision !== false ? floatVal.toFixed(precision) : floatVal;
  number = String(number).split(".");

  integer = number[0];
  decimal = number.length > 1 ? decimalSym + number[1] : "";

  rgx = /(\d+)(\d{3})/;

  while (rgx.test(integer)) {
    integer = integer.replace(rgx, "$1" + thousandSym + "$2");
  }

  return after ? integer + decimal + symbol : symbol + integer + decimal;
};


const textColumns = ['Management Fee',	'Preferred Return',	'Carried Interest', 'Sponsor Investment',	'Notes'];

const currencyColumns = ['Commitment',	'Size (M)'];

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

// camelize the string
const camelize = function camelize(str) {
  return str.replace(/\W+(.)/g, function(match, chr)
   {
        return chr.toUpperCase();
    });
};

// settings I use across tables
const defaultTabulatorSettings = {
  movableRows: true,
  columnMinWidth:100,
  resizableColumns:false,
  resizableRows:true,
  layoutColumnsOnNewData:true,
};

// a column that when pressed deletes the row
const trashCol = {
  formatter:function(cell, formatterParams, onRendered){ //plain text value
     return "<i class='fa fa-trash'></i>";
   }, minWidth: 40, width:40, headerSort:false,
   responsive:0, hozAlign:"center", cellClick:function(e, cell){
  cell.getRow().delete();
}};

const renderTable = function renderTable(tableName, tableData, element, tabulator, setIsTrue) {
  return (<div>
            <div className="w3-show-inline-block" style= {{width: "100%"}}>
                <br />
                <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
                <div style ={{float: "right", width: "130px", display: "inline-block"}}>
                  <button type="button" onClick={AddRow(tableData, tabulator, setIsTrue)}
                        className="btn btn-success btn-lg">Add Row</button>
                </div>
                <br />
                <br />
            </div>
            <div id={tableName} ref={element}/>
            <br />
          </div>);
};

// table class
function AccountTable(props) {

  const [tableData, setTableData] = useState(reformulateData(props.data));
  const [tableDataOriginal, setTableDataOriginal] = useState(props.data);
  const [tableName, setTableName] = useState(props.name);

  const el = useRef();

  const [isTrue, setIsTrue] = useState(true);

  const [tabulator, setTabulator] = useState(null); //variable to hold your table

  // tableData = reformulateData(AccountData); //data for table to display
  useEffect(() => {
    const columnNames = Object.keys(tableDataOriginal);
    let colNames = columnNames.map((colName) => {
      return {title: colName, field: colName, responsive: 0, editor:"autocomplete",
              editorParams:{freetext: true, allowEmpty: true, values:true},
             };
    });


    if (!isTrue) {
      colNames.push(trashCol);
    }

    //instantiate Tabulator when element is mounted
    const newTabulator = new Tabulator(el.current, {
       ...defaultTabulatorSettings,
       layout: "fitColumns",
       data: tableData, //link data to table
       columns: [
        {rowHandle:true, formatter:"handle", headerSort:false, responsive:0, width:30, minWidth:30},
        ...colNames
        ]//define table columns
    });
    setTabulator(newTabulator);
  }, [tableData]);



  //add table holder element to DOM
  return renderTable(tableName, tableData, el, tabulator);
}

// table class
function InvestmentTable(props) {

  const [tableData, setTableData] = useState(reformulateData(props.data));
  const [tableDataOriginal, setTableDataOriginal] = useState(props.data);
  const [tableName, setTableName] = useState(props.name);

  const [isTrue, setIsTrue] = useState(true);
  const el = useRef();
  const [tabulator, setTabulator] = useState(null); //variable to hold your table

  // get the current maximum length for all the commitment values
  let tempMaxCommitment = InvestmentData['Commitment'].reduce(function(a, b) {
      return Math.max(a.length, b.length);
  });
  tempMaxCommitment = Math.max(tempMaxCommitment, 25); // allow a minimum of 25 digits
  const [maxLengthCommitment, setMaxLengthCommitment] = useState(tempMaxCommitment);

  // get the current maximum length for all the Size (M) values
  let tempMaxSize = InvestmentData['Size (M)'].reduce(function(a, b) {
      return Math.max(a.length, b.length);
  });
  tempMaxSize = Math.max(tempMaxSize, 25); // allow a minimum of 25 digits
  const [maxLengthSize, setMaxLengthSize] = useState(tempMaxSize);

  // get the values that each column should display
  const myValues = function(colName) {
      // console.log('HERE WITH ' + colName);
      if (colName.includes('Asset Class')) {
        return AssetClassData['Name'];
      }
      else if (colName.includes('Benchmark')) {
        return BenchmarkData['Name'];
      }
      else if (colName == 'Account') {
        return AccountData['Name'];
      }
      else if (colName == 'Account Owner') {
        return OwnerData['Name'];
      }
      else {
        return true;
      }
  };

  // tableData = reformulateData(AccountData); //data for table to display
  useEffect(() => {
    const columnNames = Object.keys(tableDataOriginal);
    let colNames = columnNames.map((colName) => {
      if (colName == 'Commitment? (Y/N)') {
        return {title:colName, field:colName, editor:"tickCross",
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
            }, editor:"textarea", variableHeight:true, headerSort:false,
            minWidth: 300, width: 350, resizable:true};
      }
      else if (colName == 'Commitment' || colName == 'Size (M)') {
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
      return {title: colName, field: colName, responsive: 0,
              editor:"autocomplete",
              editorParams:{
                freetext: true,
                allowEmpty: true,
                values:myValues(colName)
              }
            };
    });

    if (!isTrue) {
      colNames.push(trashCol);
    }


    //instantiate Tabulator when element is mounted
    const newTabulator = new Tabulator(el.current, {
       ...defaultTabulatorSettings,

      data: tableData, //link data to table
      columns: [
        {rowHandle:true, formatter:"handle", headerSort:false, responsive:0, width:30, minWidth:30},
        copyCol,
        ...colNames
        ]//define table columns
    });
    setTabulator(newTabulator);
  }, [isTrue]); // add max length vars here if immediately refresh



  //add table holder element to DOM
  return renderTable(tableName, tableData, el, tabulator, setIsTrue);
}

export { AccountTable, InvestmentTable };
