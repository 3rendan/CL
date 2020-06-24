import React, {useState, useEffect, useRef} from "react";
import ReactDOM from "react-dom";
import Tabulator from "tabulator-tables"; //import Tabulator library

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const path = require('path');
const url = require('url');

const defaultTabulatorSettings = {
  movableRows: true,
  columnMinWidth:100,
  resizableColumns:false,
  resizableRows:true,
  layoutColumnsOnNewData:true,
};

function AddRow(props) {
  ipcRenderer.send('popup', props);
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


var myRowData = null;

const renderTable = function renderTable(tableName, setTableData, element, tabulator) {
  return (<div>
            <div className="w3-show-inline-block" style= {{width: "100%"}}>
                <br />
                <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
                <div style ={{float: "right", width: "130px", display: "inline-block"}}>
                  <button type="button" onClick={() => { AddRow(setTableData)}}
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
      return {title: colName, field: colName, responsive: 0};
    });

    //instantiate Tabulator when element is mounted
    const newTabulator = new Tabulator(el.current, {
       ...defaultTabulatorSettings,
       layout: "fitColumns",
       data: tableData, //link data to table
       columns: [
        ...colNames
        ]//define table columns
    });
    setTabulator(newTabulator);
  }, []); // add max length vars here if immediately refresh



  //add table holder element to DOM
  return renderTable(tableName, setTableData, el, tabulator);
}


// NAV elements
// ['Date', 'Investment', 'Amount', 'Notes']
const NAVElements = {
  'Date': ['11/23/2012'],
  'Investment': ['invest'],
  'Amount': [200],
  'Notes': ['hello'],
};

const EventsTable = (props) => {
  // Events
  // ['Type', 'Date', 'Investment', 'Amount', 'Notes']
  const Events = {
    'Type': ['INFLOW'],
    'Date': ['11/23/2012'],
    'Investment': ['invest'],
    'Amount': [200],
    'Notes': ['hello'],
  };

  return (<InvestmentTable data={Events} name={'Events'}/>);
}



export default EventsTable;
