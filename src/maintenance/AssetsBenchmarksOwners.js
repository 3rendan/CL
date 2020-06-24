import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Tabulator from "tabulator-tables"; //import Tabulator library

// data and info
// import {AccountData, InvestmentData, OwnerData, AssetClassData, BenchmarkData} from '../Data'

// const BrowserWindow = require('electron').remote.BrowserWindow;
const path = require('path');
const url = require('url');

function AddRow(data, tabulator) {
  return function() {
    data.push({});
    tabulator.replaceData(data);
  }

  //

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
  layoutColumnsOnNewData:true,
};

// add my special money formatter
Tabulator.prototype.extendModule("format", "formatters", {
    myMoney:function(cell, formatterParams){
      var floatVal = parseFloat(cell.getValue()),
          number,
          integer,
          decimal,
          rgx;

      var decimalSym = formatterParams.decimal || ".";
      var thousandSym = formatterParams.thousand || ",";
      var symbol = formatterParams.symbol || "";
      var after = !!formatterParams.symbolAfter;
      var precision = showCents ? 0 : 2;

      if (isNaN(floatVal)) {
        return this.emptyToSpace(this.sanitizeHTML(cell.getValue()));
      }

      number = precision !== false ? floatVal.toFixed(precision) : floatVal;
      number = String(number).split(".");

      integer = number[0];
      decimal = number.length > 1 ? decimalSym + number[1] : "";

      rgx = /(\d+)(\d{3})/;

      while (rgx.test(integer)) {
        integer = integer.replace(rgx, "$1" + thousandSym + "$2");
      }

      return after ? integer + decimal + symbol : symbol + integer + decimal;
    },
});


var showCents = false;

const MaintenanceTable = (props) => {
  const [tableData, setTableData] = useState(reformulateData(props.data));
  const [tableDataOriginal, setTableDataOriginal] = useState(props.data);
  const [tableName, setTableName] = useState(props.name);

  const doesAutocomplete = ['Asset Class', 'Account'].includes(tableName);

  const el = useRef();
  const [tabulator, setTabulator] = useState(null); //variable to hold your table

  useEffect(() => {
    const columnNames = Object.keys(tableDataOriginal);
    let colNames;
    if (doesAutocomplete) {
      colNames = columnNames.map((colName) => {
        return {title: colName, field: colName, responsive: 0, editor:"autocomplete",
                editorParams:{freetext: true, allowEmpty: true, values:true},
                cellEdited:function(cell){
                  console.log("cell edited!");
                }};
        });
    }
    else {
      colNames = columnNames.map((colName) => {
        return {title: colName, field: colName, responsive: 0,
               editor:"input",
               cellEdited:function(cell){
                console.log("cell edited!");
              }
            };
      });
    }

    // const currMaxHeight = BrowserWindow.getFocusedWindow().getSize()[1] * 0.50;
    //instantiate Tabulator when element is mounted
    const newTabulator = new Tabulator(el.current, {
       ...defaultTabulatorSettings,
       layout:"fitColumns",
      data: tableData, //link data to table
      columns: [
        {rowHandle:true, formatter:"handle", headerSort:false, responsive:0, width:30, minWidth:30},
        ...colNames,
        {formatter:function(cell, formatterParams, onRendered){ //plain text value
             return "<i class='fa fa-trash'></i>";
         }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
          cell.getRow().delete();
        }}
      ]//define table columns
    });
    setTabulator(newTabulator);
  }, []);

  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
          <br />
          <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
          <div style ={{float: "right", width: "130px", display: "inline-block"}}>
            <button type="button" onClick={AddRow(tableData, tabulator)} id="myButton" className="btn btn-success btn-lg">Add Row</button>
          </div>
          <br />
          <br />
      </div>
      <div id={tableName} ref={el}/>
      <br />
    </div>
  );

};

export default MaintenanceTable;
