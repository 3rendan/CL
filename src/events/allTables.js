import React, { useRef } from 'react';
import ReactDOM from 'react-dom';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

import 'font-awesome/css/font-awesome.css';

import {deleteSingleEntry} from '../serverAPI/singleEntry';
import {deleteTransfer} from '../serverAPI/transfers';

import moment from 'moment';
import {copyCol, myMoneyFormatter} from '../SpecialColumn';

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;

function AddRow(props) {
  props['id'] = BrowserWindow.getFocusedWindow().id;
  if (props.name === 'Event') {
    ipcRenderer.send('popupEvent', props);
  }
  else if (props.name === 'NAVEvent') {
    ipcRenderer.send('popupNAVEvent', props);
  }
  else if (props.name === 'Transfer') {
    ipcRenderer.send('popupTransfer', props);
  }

};

const MaintenanceTable = (props) => {
  const columnNames = props.columns;
  const tableName = props.name;

  const ref = useRef();


  let colNames = columnNames.map((colName) => {
    const fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (fieldName === 'date') {
      return {title: colName, field: fieldName, formatter:function(cell, formatterParams, onRendered){ const a = moment.utc(cell.getValue()).format('LL'); if (a === 'Invalid date') {return ""}; return a;}, responsive: 0, minWidth: 200};
    }
    else if (fieldName === 'amount') {
      const column = {title: colName +' $',
        field: fieldName, responsive: 0, minWidth: 150,
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
            cell.getElement().innerText = myMoneyFormatter(cell.getValue(), showCents);
          });
        }};
      return column;
    }
    return {title: colName, field: fieldName, responsive: 0};
  });

  const columns = [
    ...colNames,
    {formatter:function(cell, formatterParams, onRendered){ //plain text value
         return "<i class='fa fa-trash'></i>";
     }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
       const deletedData = cell.getData();
       if (tableName === 'Event' || tableName === 'NAVEvent') {
         deleteSingleEntry(deletedData.id)
       }
       else if (tableName === 'Transfer') {
         deleteTransfer(deletedData.id)
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
          <button type="button" onClick={() => { AddRow({data: props.data, name: tableName})}}
                className="btn btn-success btn-lg">Add Row</button>
        </div>
        <br />
        <br />
      </div>
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={props.data}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );

};



export default MaintenanceTable;
