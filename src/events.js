import React, {useState, useEffect, useRef} from "react";
import ReactDOM from "react-dom";
import Tabulator from "tabulator-tables"; //import Tabulator library

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const BrowserWindow  = electron.remote.BrowserWindow;



const defaultTabulatorSettings = {
  movableRows: true,
  columnMinWidth:100,
  resizableColumns:false,
  resizableRows:true,
  layoutColumnsOnNewData:true,
};

var myRowData = null;
var investmentName = null;
ipcRenderer.on('message', (event, args) => {
  myRowData = args;
  investmentName = args.Name;
});

function AddRow(props) {
  props['id'] = BrowserWindow.getFocusedWindow().id;
  if (props.name === 'Events') {
    ipcRenderer.send('popupEvent', props);
  }
  else if (props.name === 'NAVEvents') {
    ipcRenderer.send('popupNAVEvent', props);
  }

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

const renderTable = function renderTable(tableName, tableData, setTableData, element, tabulator) {
  return (<div>
            <div className="w3-show-inline-block" style= {{width: "100%"}}>
                <br />
                <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
                <div style ={{float: "right", width: "130px", display: "inline-block"}}>
                  <button type="button" onClick={() => { AddRow({data: tableData, name: tableName, investmentName: investmentName})}}
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
const EventsTable = (props) => {
  const [tableData, setTableData] = useState(reformulateData(props.data));
  const tableName = props.name;

  const el = useRef();

  const [tabulator, setTabulator] = useState(null); //variable to hold your table

  ipcRenderer.on('replyEvent', (event, message) => {
    if (tableName === 'Events') {
      let copyTableData = [...tableData, message]
      setTableData(copyTableData);
    }
  });

  ipcRenderer.on('replyNAVEvent', (event, message) => {
    if (tableName === 'NAVEvents') {
      let copyTableData = [...tableData, message]
      setTableData(copyTableData);
    }
  });

  // tableData = reformulateData(AccountData); //data for table to display
  useEffect(() => {
    const columnNames = Object.keys(tableData[0]);
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
  }, [tableData]); // add max length vars here if immediately refresh



  //add table holder element to DOM
  return renderTable(tableName, tableData, setTableData, el, tabulator);
}


export default EventsTable;
