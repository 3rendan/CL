import React, {Fragment, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

import 'font-awesome/css/font-awesome.css';
import '../centerHeaders.css';

import {deleteTransfer} from '../serverAPI/transfers';

import {getInvestments, getInvestment} from '../serverAPI/investments'

import moment from 'moment';
import {copyCol, myDateSort, myMoneyFormatter,
   initialMoneyPercentFormatter, rightClickMoneyPercent} from '../SpecialColumn';

import '../shrinkFontSize.css';

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

const electron = window.require('electron');
const dialog = electron.remote.dialog
const ipcRenderer  = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;

function AddRow(props) {
  props['id'] = BrowserWindow.getFocusedWindow().id;
  ipcRenderer.send('popupTransfer', props);
};

function EditRow(props) {
  props['id'] = BrowserWindow.getFocusedWindow().id;
  ipcRenderer.send('popupTransfer', props);
};

const MaintenanceTable = (props) => {
  const columnNames = props.columns;
  const tableName = props.name;
  const investmentID = props.investmentID;
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const [investmentName, setInvestmentName] = useState('');

  const ref = React.createRef();

  // manual transforms
    // 1) Date -> Date Due
    // turn other money fileds into money
  useEffect(() => {
    async function fetchInvestments() {
      setInvestmentName('Data')


      const investmentsTemp = await getInvestments();
      const investments = {};
      investmentsTemp.map((investment) => {
        investments[investment.id] = investment;
        if (investment.id === investmentID) {
          setInvestmentName(investment.long_name);
        }
      })

      // rename data
      let manipulatedData = props.data.map((datum) => {
        if (datum.from_investment !== undefined) {
          if (!isNaN(datum.from_investment)) {
            datum.from_investment = investments[datum.from_investment].name;
          }
        }
        if (datum.to_investment !== undefined) {
          if (!isNaN(datum.to_investment)) {
            datum.to_investment = investments[datum.to_investment].name;
          }
        }


        if (datum.date !== undefined) {
          datum.date_due = datum.date;
        }
        if (datum.amount !== undefined) {
          datum.net_amount = datum.amount;
        }

        return datum;
      });

      setData(manipulatedData)
    }
    fetchInvestments().catch(e =>
      setError(e)
    )
  }, [])

  ipcRenderer.on('replyTransfer', (event, message) => {
    BrowserWindow.getAllWindows().map(window => window.reload())
  });

  const headerSort = true;

  let colNames = columnNames.map((colName) => {
    const frozen = props.frozenColumns ? props.frozenColumns.includes(colName) : false;
    let fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (fieldName === 'amount' || (props.moneyColumns !== undefined && props.moneyColumns.includes(colName))) {
      const column = {title: colName,
        field: fieldName, responsive: 0,
        align: 'right',
        formatter: initialMoneyPercentFormatter,
        minWidth: 130,
        headerTooltip: 'Right Click to toggle cents',
        headerSort:headerSort, sorter:'number',
        headerContext: rightClickMoneyPercent};
      return column;
    }
    else if (fieldName === 'date_sent') {
      return {title: colName, field: fieldName,
        formatter:function(cell, formatterParams, onRendered){
          if (cell.getValue() === cell.getData()['date_due']) {
            return "";
          };
          if (cell.getValue() === undefined) {
            return "";
          }
          const a = moment.utc(cell.getValue()).format('L');
          if (a === 'Invalid date') {
            return ""
          };
          return a;
        }, responsive: 0, frozen: frozen,
        sorter:function(a, b, aRow, bRow, column, dir, sorterParams){
          //a, b - the two values being compared
          //aRow, bRow - the row components for the values being compared (useful if you need to access additional fields in the row data for the sort)
          //column - the column component for the column being sorted
          //dir - the direction of the sort ("asc" or "desc")
          //sorterParams - sorterParams object from column definition array
          return myDateSort(a, b);
        }, headerSort:headerSort};
    }
    else if (fieldName === 'date_due') {
      return {title: colName, field: fieldName,
        formatter:function(cell, formatterParams, onRendered){
          if (cell.getValue() === undefined) {
            return "";
          }
          const a = moment.utc(cell.getValue()).format('L');
          if (a === 'Invalid date') {
            return ""
          };
          return a;
        }, responsive: 0, frozen: frozen,
        sorter:function(a, b, aRow, bRow, column, dir, sorterParams){
          //a, b - the two values being compared
          //aRow, bRow - the row components for the values being compared (useful if you need to access additional fields in the row data for the sort)
          //column - the column component for the column being sorted
          //dir - the direction of the sort ("asc" or "desc")
          //sorterParams - sorterParams object from column definition array
          return myDateSort(a, b);
        }, headerSort:false};
    }
    else if (fieldName === 'date') {
      return {title: colName, field: fieldName,
        formatter:function(cell, formatterParams, onRendered){
          if (cell.getValue() === undefined) {
            return "";
          }
          const a = moment.utc(cell.getValue()).format('L');
          if (a === 'Invalid date') {
            return ""
          };
          return a;
        }, responsive: 0, frozen: frozen,
        sorter:function(a, b, aRow, bRow, column, dir, sorterParams){
          //a, b - the two values being compared
          //aRow, bRow - the row components for the values being compared (useful if you need to access additional fields in the row data for the sort)
          //column - the column component for the column being sorted
          //dir - the direction of the sort ("asc" or "desc")
          //sorterParams - sorterParams object from column definition array
          return myDateSort(a, b);
        }, headerSort:headerSort};
    }
    else if (fieldName === 'notes') {
      return {title: colName, field: fieldName, responsive: 0,
             frozen: frozen, minWidth: 600,
              sorter: 'string', headerSort:headerSort};
    }
    return {title: colName, field: fieldName, responsive: 0,
           frozen: frozen,
            sorter: 'string', headerSort:headerSort};
  });

  const trashCol = {formatter:function(cell, formatterParams, onRendered){ //plain text value
       return "<i class='fa fa-trash'></i>";
   }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
     let options  = {
      buttons: ["Yes","No"],
      message: 'Confirm Delete?'
     }
     const confirmed = dialog.showMessageBoxSync(options)
     // const confirmed = window.confirm('Confirm Delete?')
     if (confirmed === 1) {
       return;
     }
     const deletedData = cell.getData();
     deleteTransfer(deletedData.id)

     cell.getRow().delete();
     BrowserWindow.getAllWindows().map(window => window.reload())
  }};

  const editCol = {formatter:function(cell, formatterParams, onRendered){ //plain text value
       return "<i class='fa fa-edit'></i>";
   }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
     const row = cell.getRow();
     EditRow({dataID: row.getData().id, dataType: row.getData().type, hasCommitment:props.hasCommitment, investmentID: investmentID, name: tableName})
  }};



  const columns = [
    ...colNames
  ];


  columns.push(editCol)
  columns.push(trashCol)

  let addRow = tableName === 'NAV' ? null :
  (<div style ={{float: "right", width: "130px", display: "inline-block"}}>
    <button type="button" onClick={() => { AddRow({data: props.data, hasCommitment:props.hasCommitment, investmentID: investmentID, name: tableName})}}
          className="btn btn-success btn-lg">Add Row</button>
  </div>);
  const marginRight = tableName === 'NAV' ? '130px' : '0px';
  const copyButton = (<div style ={{float: "right", marginRight: marginRight, width: "130px", display: "inline-block"}}>
    <button type="button" onClick={() => { ref.current.table.download("csv", `${tableName}_${investmentName}.csv`)}}
          className="btn btn-success btn-lg">Copy Data</button>
  </div>)

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }

  const headerStyle = tableName === 'Transfers' ? {margin: 0, marginLeft: '40%', display: "inline-block"} : {margin: 0, display: "inline-block"}

  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
        <br />
        <h1 style = {headerStyle}> {tableName} </h1>
        {addRow}
        {copyButton}
        <br />
        <br />
      </div>
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={data}
        options={{layout: "fitData",
                  initialSort: [{column: 'type', dir:'asc'},
                                {column: "date_due", dir:'asc'},
                                {column: "date", dir:'asc'}],
                  downloadDataFormatter: (data) => data,
                  downloadReady: (fileContents, blob) => blob,
                  maxHeight: "400px",
                }}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );

};



export default MaintenanceTable;
