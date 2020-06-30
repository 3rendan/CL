import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

import {copyCol, myMoneyFormatter} from '../SpecialColumn';

import {getOwners} from '../serverAPI/owners.js'
import {getBenchmarks} from '../serverAPI/benchmarks.js'
import {getAssetClasses} from '../serverAPI/assetClass.js'
import {getAccounts} from '../serverAPI/accounts.js'
import {Investment, getInvestments, updateInvestment, insertInvestment, deleteInvestment, colToInvestmentFields} from '../serverAPI/investments.js'

import 'font-awesome/css/font-awesome.css';
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)


import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

const textColumns = ['Management Fee',	'Preferred Return',	'Carried Interest',
                    'Sponsor Investment',	'Notes'];

const currencyColumns = ['Commitment',	'Size (M)'];

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
     const deletedData = cell.getData();
     deleteInvestment(deletedData);
     cell.getRow().delete();
}};

// table class
function InvestmentTable(props) {
  const AccountData = props.AccountData;
  const OwnerData = props.OwnerData;
  const AssetClassData = props.AssetClassData;
  const BenchmarkData = props.BenchmarkData;
  const InvestmentData = props.data;


  const [tableData, setTableData] = useState(props.data);
  const tableName = props.name;
  const columnNames = props.columns;

  const [isTrue, setIsTrue] = useState(true);
  const ref = useRef();

  // get the current maximum length for all the commitment values
  let tempMaxCommitment = InvestmentData.length !== 0 ? Math.max(...InvestmentData.map(i => {
    try {
      return i.commitment.length;
    }
    catch(err) {
      return 0;
    }
  }
  )) : 0;
  tempMaxCommitment = Math.max(tempMaxCommitment, 25); // allow a minimum of 25 digits
  const [maxLengthCommitment, setMaxLengthCommitment] = useState(tempMaxCommitment);

  // get the current maximum length for all the Size (M) values
  let tempMaxSize =  InvestmentData.length !== 0 ? Math.max(...InvestmentData.map(i => {
    try {
      return i.size.length;
    }
    catch(err) {
      return 0;
    }
  }
  )) : 0;
  tempMaxSize = Math.max(tempMaxSize, 25); // allow a minimum of 25 digits
  const [maxLengthSize, setMaxLengthSize] = useState(tempMaxSize);

  // get the values that each column should display
  const myValues = function(colName) {
    if (colName.includes('Asset Class')) {
      return AssetClassData.map(i => i.name);
    }
    else if (colName.includes('Benchmark')) {
      return BenchmarkData.map(i => i.name);
    }
    else if (colName == 'Account') {
      return AccountData.map(i => i.name);
    }
    else if (colName == 'Account Owner') {
      return OwnerData.map(i => i.name);
    }
    else {
      return true;
    }
  };

  let columns = columnNames.map((colName) => {
    const fieldName = colToInvestmentFields(colName);
    if (colName === 'Commitment (Y/N)') {
      return {title:colName, field:fieldName, editor:"tickCross",
        minWidth: 175,
        formatter:"tickCross", formatterParams:{
            allowEmpty:false,
            allowTruthy:true,
            tickElement:"<i class='fa fa-check'></i>",
            crossElement:"<i class='fa fa-times'></i>",
      }, cellEdited:function(cell) {
          const newData = cell.getData();
          const newInvestment = new Investment(newData);
          updateInvestment(newInvestment);
      }
      };
    }
    else if (textColumns.includes(colName)) {
      return {title: colName, field:fieldName, responsive: 0,
              formatter:"textarea",  formatterParams:{
                  elementAttributes:{
                      maxLength:"300", //set the maximum character length of the textarea element to 10 characters
                  }
          }, editor:"textarea", variableHeight:true, headerSort:false,
          cellEdited:function(cell) {
              const newData = cell.getData();
              const newInvestment = new Investment(newData);
              updateInvestment(newInvestment);
          },
          minWidth: 300, width: 350, resizable:true};
    }
    else if (currencyColumns.includes(colName)) {
      return {title: colName +' $',
        field: fieldName, responsive: 0, minWidth: 150,
        editor: "number",
        cellEdited:function(cell) {
            const newData = cell.getData();
            const newInvestment = new Investment(newData);
            updateInvestment(newInvestment);
        },
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
            cell.getElement().innerText = myMoneyFormatter(cell.getValue(), !showCents);
          });
        }};
    }
    return {title: colName, field: fieldName, responsive: 0,
            minWidth: 200,
            editor:"autocomplete",
            cellEdited:function(cell) {
                const newData = cell.getData();
                const newInvestment = new Investment(newData);
                updateInvestment(newInvestment);
            },
            editorParams:{
              showListOnEmpty:true,
              freetext: true,
              allowEmpty: true,
              searchingPlaceholder:"Filtering ...", //set the search placeholder
              values:myValues(colName)
            }
          };
  });



  //add table holder element to DOM
  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
          <br />
          <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
          <div style ={{float: "right", width: "130px", display: "inline-block"}}>
            <button type="button" onClick={() =>
              {
                const data = new Investment(null);
                insertInvestment(data).then((response) => {
                  console.log(response)
                  ref.current.table.addData(response)
                });
              }
              }
             id="myButton"
            className="btn btn-success btn-lg">Add Row</button>
          </div>
          <br />
          <br />
      </div>
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={tableData}
        options={defaultTabulatorSettings}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );
}

// table class
function ViewInvestmentTable(props) {
  const InvestmentData = props.data;
  const [tableData, setTableData] = useState(props.data);
  console.log(tableData)
  const tableName = props.name;
  const columnNames = props.columns;

  const ref = useRef();

  // get the current maximum length for all the commitment values
  let tempMaxCommitment = InvestmentData.length !== 0 ? Math.max(...InvestmentData.map(i => {
    try {
      return i.commitment.length;
    }
    catch(err) {
      return 0;
    }
  }
  )) : 0;
  tempMaxCommitment = Math.max(tempMaxCommitment, 25); // allow a minimum of 25 digits
  const [maxLengthCommitment, setMaxLengthCommitment] = useState(tempMaxCommitment);

  // get the current maximum length for all the Size (M) values
  let tempMaxSize =  InvestmentData.length !== 0 ? Math.max(...InvestmentData.map(i => {
    try {
      return i.size.length;
    }
    catch(err) {
      return 0;
    }
  }
  )) : 0;
  tempMaxSize = Math.max(tempMaxSize, 25); // allow a minimum of 25 digits
  const [maxLengthSize, setMaxLengthSize] = useState(tempMaxSize);


  let columns = columnNames.map((colName) => {
    if (colName === 'Commitment? (Y/N)') {
      return {title:colName, field:colName,
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
          }, variableHeight:true,
          minWidth: 300, width: 350, resizable:true};
    }
    else if (currencyColumns.includes(colName)) {
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
            cell.getElement().innerText = myMoneyFormatter(cell.getValue(), !showCents);
          });
        }};
    }
    return {title: colName, field: colName, responsive: 0};
  });



  //add table holder element to DOM
  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
          <br />
          <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
          <br />
          <br />
      </div>
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={tableData}
        options={defaultTabulatorSettings}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );
}

export { InvestmentTable as DetailInvestmentTable, ViewInvestmentTable };
