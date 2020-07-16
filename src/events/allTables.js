import React, { useRef, useState, useEffect } from 'react';
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
  const investmentID = props.investmentID;
  const [data, setData] = useState(null);


  console.log(props.moneyColumns)
  console.log(props.data)
  // manual transforms
    // 1) Date -> Date Due
    // turn other money fileds into money
  useEffect(() => {
    async function fetchInvestments() {
      const investmentsTemp = await getInvestments();
      const investments = {};
      investmentsTemp.map((investment) => {
        investments[investment.id] = investment;
      })
      const manipulatedData = props.data.map((datum) => {
        if (datum.from_investment !== undefined) {
          datum.from_investment = investments[datum.from_investment].long_name;
        }
        if (datum.investment !== undefined) {
          datum.investment = investments[datum.investment].long_name;
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
    fetchInvestments();
  }, [])


  const ref = useRef();

  console.log(columnNames)
  let colNames = columnNames.map((colName) => {
    let fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (fieldName === 'amount' || (props.moneyColumns !== undefined && props.moneyColumns.includes(colName))) {
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
    else if (fieldName === 'date_due' || fieldName === 'date_sent') {
      return {title: colName, field: fieldName,
        formatter:function(cell, formatterParams, onRendered){
          if (cell.getValue() === undefined) {
            return "";
          }
          const a = moment.utc(cell.getValue()).format('LL');
          if (a === 'Invalid date') {
            return ""
          };
          return a;
        }, responsive: 0, minWidth: 200};
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
    }}
  ];


  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
        <br />
        <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
        <div style ={{float: "right", width: "130px", display: "inline-block"}}>
          <button type="button" onClick={() => { AddRow({data: props.data, hasCommitment:props.hasCommitment, investmentID: investmentID, name: tableName})}}
                className="btn btn-success btn-lg">Add Row</button>
        </div>
        <br />
        <br />
      </div>
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={props.data}
        options={{layout: "fitDataFill"}}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );

};



export default MaintenanceTable;
