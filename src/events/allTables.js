import React, {Fragment, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

import 'font-awesome/css/font-awesome.css';

import {deleteSingleEntry} from '../serverAPI/singleEntry';
import {deleteTransfer} from '../serverAPI/transfers';
import {deleteContribution} from '../serverAPI/contributions';
import {deleteDistribution} from '../serverAPI/distributions';
import {deleteCommission} from '../serverAPI/commissions';

import {getInvestments} from '../serverAPI/investments'

import moment from 'moment';
import {copyCol, myDateSort,
  myMoneyFormatter, initialMoneyFormatter, rightClickMoney} from '../SpecialColumn';

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
  else if (props.name === 'NAV Entries') {
    ipcRenderer.send('popupNAVEvent', props);
  }
  else if (props.name === 'Transfer') {
    ipcRenderer.send('popupTransfer', props);
  }

};

const MaintenanceTable = (props) => {
  const columnNames = props.columns;
  const tableName = props.name;
  const investmentID = props.investmentID;
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const ref = React.createRef();

  // manual transforms
    // 1) Date -> Date Due
    // turn other money fileds into money
  useEffect(() => {
    async function fetchInvestments() {
      if (tableName === 'NAV' || tableName === 'NAV Entries') {
        setData(props.data);
        return;
      }

      const investmentsTemp = await getInvestments();
      const investments = {};
      investmentsTemp.map((investment) => {
        investments[investment.id] = investment;
      })

      // rename data
      let manipulatedData = props.data.map((datum) => {
        if (datum.from_investment !== undefined) {
          datum.from_investment = investments[datum.from_investment].name;
        }
        if (datum.to_investment !== undefined) {
          datum.to_investment = investments[datum.to_investment].name;
        }
        if (datum.investment !== undefined) {
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

        let net_commitment = props.commitment;

        try {
          net_commitment = parseFloat(net_commitment.substring(1));
        }
        catch (e) {}
        manipulatedData.map((datum) => {
          if (datum.type === 'CONTRIBUTION') {
            let main = datum.main;
            try {
              main = datum.main ? parseFloat(datum.main.substring(1)) : 0;
            }
            catch (e) {}
            net_commitment -= main;

            let fees = datum.fees;
            try {
              fees = datum.fees ? parseFloat(datum.fees.substring(1)) : 0;
            }
            catch (e) {}
            net_commitment -= fees;

            let tax = datum.tax;
            try {
              tax = datum.tax ? parseFloat(datum.tax.substring(1)) : 0;
            }
            catch (e) {}
            net_commitment -= tax;
          }
          else if (datum.type === 'DISTRIBUTION') {
            let recallable = datum.recallable;
            try {
              recallable = datum.recallable ? parseFloat(datum.recallable.substring(1)) : 0;
            }
            catch (e) {}
            net_commitment -= recallable;
          }
          datum.net_commitment = net_commitment;
        });
      }

      setData(manipulatedData)
    }
    fetchInvestments().catch(e =>
      setError(e)
    )
  }, [])

  ipcRenderer.on('replyEvent', (event, message) => {
    let copyTableData = [message]
    if (data !== null) {
      copyTableData = [...data, message]
    }

    setData(copyTableData);
  });

  ipcRenderer.on('replyNAVEvent', (event, message) => {
    let copyTableData = [message]
    if (data !== null) {
      copyTableData = [...data, message]
    }

    setData(copyTableData);
  });

  ipcRenderer.on('replyTransfer', (event, message) => {
    let copyTableData = [message]
    if (data !== null) {
      copyTableData = [...data, message]
    }

    setData(copyTableData);
  });



  let colNames = columnNames.map((colName) => {
    const frozen = props.frozenColumns ? props.frozenColumns.includes(colName) : false;
    let fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (fieldName === 'amount' || (props.moneyColumns !== undefined && props.moneyColumns.includes(colName))) {
      const column = {title: colName,
        field: fieldName, responsive: 0,
        align: 'right',
        formatter: initialMoneyFormatter,
        headerTooltip: 'Right Click to toggle cents',
        headerSort:false, sorter:'number',
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
        }, headerSort:false};
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
        }, headerSort:false};
    }
    return {title: colName, field: fieldName, responsive: 0,
           frozen: frozen,
            sorter: 'string', headerSort:false};
  });

  const trashCol = {formatter:function(cell, formatterParams, onRendered){ //plain text value
       return "<i class='fa fa-trash'></i>";
   }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
     const confirmed = window.confirm('Confirm Delete?')
     if (!confirmed) {
       return;
     }
     const deletedData = cell.getData();
     if (tableName === 'Event' || tableName === 'NAV Entries') {
       if (deletedData.type === 'CONTRIBUTION') {
         deleteContribution(deletedData.id)
       }
       else if (deletedData.type === 'DISTRIBUTION') {
         deleteDistribution(deletedData.id)
       }
       else if (deletedData.type === 'COMMISH') {
         deleteCommission(deletedData.id)
       }
       else {
         deleteSingleEntry(deletedData.id)
       }
     }
     else if (tableName === 'Transfer') {
       deleteTransfer(deletedData.id)
     }

     cell.getRow().delete();
  }};


  const columns = [
    ...colNames,
    copyCol
  ];

  if (tableName !== 'NAV') {
    columns.push(trashCol)
  }

  let addRow = tableName === 'NAV' ? null :
  (<div style ={{float: "right", width: "130px", display: "inline-block"}}>
    <button type="button" onClick={() => { AddRow({data: props.data, hasCommitment:props.hasCommitment, investmentID: investmentID, name: tableName})}}
          className="btn btn-success btn-lg">Add Row</button>
  </div>);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }

  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
        <br />
        <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
        {addRow}
        <br />
        <br />
      </div>
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={data}
        options={{layout: "fitData",
                  initialSort: [{column: "date_due", dir:'asc'}]}}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );

};



export default MaintenanceTable;
