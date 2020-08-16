import React, {Fragment, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

import 'font-awesome/css/font-awesome.css';
import '../centerHeaders.css';

import {deleteSingleEntry} from '../serverAPI/singleEntry';
import {deleteTransfer} from '../serverAPI/transfers';
import {deleteContribution} from '../serverAPI/contributions';
import {deleteDistribution} from '../serverAPI/distributions';
import {deleteCommission} from '../serverAPI/commissions';

import {getInvestments, getInvestment} from '../serverAPI/investments'

import moment from 'moment';
import {copyCol, myDateSort, myMoneyFormatter,
   initialMoneyFormatter, rightClickMoney} from '../SpecialColumn';

import '../shrinkFontSize.css';

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

const electron = window.require('electron');
const dialog = electron.remote.dialog
const ipcRenderer  = electron.ipcRenderer;
const BrowserWindow = electron.remote.BrowserWindow;

function AddRow(props) {
  props['id'] = BrowserWindow.getFocusedWindow().id;
  if (props.name === 'Events') {
    ipcRenderer.send('popupEvent', props);
  }
  else if (props.name === 'NAV Entries') {
    ipcRenderer.send('popupNAVEvent', props);
  }
  else if (props.name === 'Transfers') {
    ipcRenderer.send('popupTransfer', props);
  }
};

function EditRow(props) {
  props['id'] = BrowserWindow.getFocusedWindow().id;
  if (props.name === 'Events') {
    ipcRenderer.send('popupEvent', props);
  }
  else if (props.name === 'NAV Entries') {
    ipcRenderer.send('popupNAVEvent', props);
  }
  else if (props.name === 'Transfers') {
    ipcRenderer.send('popupTransfer', props);
  }
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
    // setBrowserWindow()
    async function fetchInvestments() {
      if (tableName === 'Transfers') {
        setInvestmentName('Data')
      }
      else {
        const thisInvestment = await getInvestment(investmentID);
        setInvestmentName(thisInvestment.long_name)
      }

      if (tableName === 'NAV' || tableName === 'NAV Entries') {
        setData(props.data);
        return;
      }


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
          datum.from_investment = investments[datum.from_investment].name;
        }
        if (datum.to_investment !== undefined) {
          datum.to_investment = investments[datum.to_investment].name;
        }
        if (datum.investment === undefined) {
          datum.investment = datum.to_investment
        }
        else { // if (datum.investment !== undefined) {
          datum.investment = investments[datum.investment].name;
        }
        if (datum.date !== undefined) {
          datum.date_due = datum.date;
        }
        if (datum.amount !== undefined) {
          datum.net_amount = datum.amount;
        }

        return datum;
      });
      // calculate net commitment after each transaction
      if (props.hasCommitment) {
        manipulatedData = manipulatedData.sort(function(a, b) {
          return myDateSort(a.date_due, b.date_due)
        });

        let remaining_commitment = props.commitment;

        manipulatedData.map((datum) => {
          if (datum.type === 'CONTRIBUTION') {
            let main = datum.main;
            try {
              main = datum.main ? parseFloat(datum.main.substring(1)) : 0;
            }
            catch (e) {}
            remaining_commitment -= main;

            let fees = datum.fees;
            try {
              fees = datum.fees ? parseFloat(datum.fees.substring(1)) : 0;
            }
            catch (e) {}
            remaining_commitment -= fees;

            let tax = datum.tax;
            try {
              tax = datum.tax ? parseFloat(datum.tax.substring(1)) : 0;
            }
            catch (e) {}
            remaining_commitment -= tax;
          }
          else if (datum.type === 'DISTRIBUTION') {
            let recallable = datum.recallable;
            try {
              recallable = datum.recallable ? parseFloat(datum.recallable.substring(1)) : 0;
            }
            catch (e) {}
            remaining_commitment -= recallable;
          }
          datum.remaining_commitment = remaining_commitment;
        });
      }

      setData(manipulatedData)
    }
    fetchInvestments().catch(e =>
      setError(e)
    )
  }, [])

  ipcRenderer.on('replyEvent', (event, message) => {
    BrowserWindow.getAllWindows().map(window => window.reload())
  });

  ipcRenderer.on('replyNAVEvent', (event, message) => {
    BrowserWindow.getAllWindows().map(window => window.reload())
  });

  ipcRenderer.on('replyTransfer', (event, message) => {
    BrowserWindow.getAllWindows().map(window => window.reload())
  });

  const headerSort = tableName === 'Transfers';

  let colNames = columnNames.map((colName) => {
    const frozen = props.frozenColumns ? props.frozenColumns.includes(colName) : false;
    let fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (fieldName === 'amount' || (props.moneyColumns !== undefined && props.moneyColumns.includes(colName))) {
      const column = {title: colName,
        field: fieldName, responsive: 0,
        align: 'right',
        formatter: initialMoneyFormatter,
        minWidth: 130,
        headerTooltip: 'Right Click to toggle cents',
        headerSort:headerSort, sorter:'number',
        headerContext: rightClickMoney};
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
     if (tableName === 'Events' || tableName === 'NAV Entries') {
       if (deletedData.type === 'CONTRIBUTION') {
         deleteContribution(deletedData.id)
       }
       else if (deletedData.type === 'DISTRIBUTION') {
         deleteDistribution(deletedData.id)
       }
       else if (deletedData.type === 'COMMISH') {
         deleteCommission(deletedData.id)
       }
       else if (deletedData.type === 'TRANSFER') {
         deleteTransfer(deletedData.id)
       }
       else {
         deleteSingleEntry(deletedData.id)
       }
     }
     else if (tableName === 'Transfers') {
       deleteTransfer(deletedData.id)
     }

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
    ...colNames,
    editCol
  ];

  if (tableName !== 'NAV') {
    columns.push(trashCol)
  }

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
                  initialSort: [{column: "date_due", dir:'asc'},
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
