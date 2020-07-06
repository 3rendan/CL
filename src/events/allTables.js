import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

import 'font-awesome/css/font-awesome.css';

import {deleteSingleEntry} from '../serverAPI/singleEntry';

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const BrowserWindow = electron.BrowserWindow;

function AddRow(props) {
  props['id'] = BrowserWindow.getFocusedWindow().id;
  if (props.name === 'Events') {
    ipcRenderer.send('popupEvent', props);
  }
  else if (props.name === 'NAVEvents') {
    ipcRenderer.send('popupNAVEvent', props);
  }
  else if (props.name === 'Transfers') {
    ipcRenderer.send('popupTransfer', props);
  }

};

const MaintenanceTable = (props) => {
  const [tableData, setTableData] = useState(props.data);
  const columnNames = props.columns;
  const tableName = props.name;

  const ref = useRef();


  let colNames = columnNames.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    return {title: colName, field: fieldName, responsive: 0,
           editor:"input"};
  });

  const columns = [
    {rowHandle:true, formatter:"handle", headerSort:false,
      responsive:0, width:30, minWidth:30},
    ...colNames,
    {formatter:function(cell, formatterParams, onRendered){ //plain text value
         return "<i class='fa fa-trash'></i>";
     }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
       const deletedData = cell.getData();
       if (tableName === 'Event') {
         deleteSingleEntry(deletedData.id)
       }
       else if (tableName === 'NAVEvents') {
       }
       else if (tableName === 'Transactions') {
       }

       cell.getRow().delete();
    }}
  ];


  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
        <br />
        <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
        <div style ={{float: "right", width: "130px", display: "inline-block"}}>
          <button type="button" onClick={() => { AddRow({data: tableData, name: tableName})}}
                className="btn btn-success btn-lg">Add Row</button>
        </div>
        <br />
        <br />
      </div>
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={tableData}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );

};



export default MaintenanceTable;
