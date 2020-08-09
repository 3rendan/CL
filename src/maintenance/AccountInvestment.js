import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import {myMoneyFormatter, eventsCol, defaultTabulatorSettings,
        myDateSort, copyCol,
        rightClickMoney, initialMoneyFormatter} from '../SpecialColumn';

import moment from 'moment';


import {Investment, updateInvestment, insertInvestment, deleteInvestment,
  colToInvestmentFields} from '../serverAPI/investments.js'

import 'font-awesome/css/font-awesome.css';
import '../centerHeaders.css';
import '../shrinkFontSize.css';
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)


import { React15Tabulator } from "react-tabulator"; // for React 15.x

window.moment = moment;

const electron = window.require('electron');
const dialog = electron.remote.dialog

const textColumns = ['Management Fee',	'Preferred Return',	'Carried Interest',
                    'Sponsor Investment',	'Notes'];

const currencyColumns = ['Commitment',	'Size (M)'];
const dateColumns = ['End of Term', 'Close Date'];
const dropdownColumns = ['Primary Benchmark', 'Secondary Benchmark',
                  'Asset Class', 'Sub Asset Class', 'Account', 'Owner']

var accountNameToId = {}
var accountNames = []
var assetClassNameToId = {}
var assetClassNames = []
var benchmarkNameToId = {}
var benchmarkNames = []
var ownerNameToId = {}
var ownerNames = []

//Create Date Editor
var dateEditor = function(cell, onRendered, success, cancel){
    //cell - the cell component for the editable cell
    //onRendered - function to call when the editor has been rendered
    //success - function to call to pass the successfuly updated value to Tabulator
    //cancel - function to call to abort the edit and return to a normal cell

    //create and style input
    var cellValue = moment(cell.getValue(), "MM/DD/YYYY").format("YYYY-MM-DD"),
    input = document.createElement("input");

    input.setAttribute("type", "date");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;

    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    function onChange(){
        if(input.value !== cellValue){
            success(moment(input.value, "YYYY-MM-DD").format("MM/DD/YYYY"));
        }else{
            cancel();
        }
    }

    //submit new value on blur or change
    input.addEventListener("blur", onChange);

    //submit new value on enter
    input.addEventListener("keydown", function(e){
        if(e.keyCode === 13){
            onChange();
        }

        if(e.keyCode === 27){
            cancel();
        }
    });

    return input;
};

// get the values that each column should display
const myValues = function(colName) {
  if (colName.includes('Asset Class')) {
    return assetClassNames;
  }
  else if (colName.includes('Benchmark')) {
    return benchmarkNames;
  }
  else if (colName === 'Account') {
    return accountNames;
  }
  else if (colName ==='Owner') {
    return ownerNames;
  }
  else {
    return true;
  }
};

function columnNameToDefintion(colName, readOnly) {
  const fieldName = colToInvestmentFields(colName);
  if (colName === 'Commitment (Y/N)') {
    const column = {title:colName, field:fieldName,
      formatter:"tickCross", formatterParams:{
          allowEmpty:false,
          allowTruthy:true,
          tickElement:"<i class='fa fa-check'></i>",
          crossElement:""
      }
    };
    if (!readOnly) {
      column['editor'] = 'tickCross';
      column['cellEdited'] = function(cell) {
          const newData = cell.getData();
          Object.keys(newData).map(fieldName => {
            if (fieldName.includes('asset_class')) {
              if (newData[fieldName] in assetClassNameToId) {
                newData[fieldName] = assetClassNameToId[newData[fieldName]]
              }
            }
            else if (fieldName.includes('benchmark')) {
              if (newData[fieldName] in benchmarkNameToId) {
                newData[fieldName] = benchmarkNameToId[newData[fieldName]]
              }
            }
            else if (fieldName === 'account') {
              if (newData[fieldName] in accountNameToId) {
                newData[fieldName] = accountNameToId[newData[fieldName]]
              }
            }
            else if (fieldName ==='owner') {
              if (newData[fieldName] in ownerNameToId) {
                newData[fieldName] = ownerNameToId[newData[fieldName]]
              }
            }
            if (newData[fieldName] === '') {
              newData[fieldName] = null;
            }
          })
          const newInvestment = new Investment(newData);
          updateInvestment(newInvestment);
      };
    }
    return column;
  }
  else if (textColumns.includes(colName)) {
    const column = {title: colName, field:fieldName, responsive: 0,
            formatter:"textarea",  formatterParams:{
                elementAttributes:{
                    maxLength:"300", //set the maximum character length of the textarea element to 10 characters
                }
        }, variableHeight:true, headerSort:false,
        minWidth: 300, width: 350, resizable:true};
    if (!readOnly) {
      column['editor'] = 'textarea';
      column['cellEdited'] = function(cell) {
          const newData = cell.getData();
          Object.keys(newData).map(fieldName => {
            if (fieldName.includes('asset_class')) {
              if (newData[fieldName] in assetClassNameToId) {
                newData[fieldName] = assetClassNameToId[newData[fieldName]]
              }
            }
            else if (fieldName.includes('benchmark')) {
              if (newData[fieldName] in benchmarkNameToId) {
                newData[fieldName] = benchmarkNameToId[newData[fieldName]]
              }
            }
            else if (fieldName === 'account') {
              if (newData[fieldName] in accountNameToId) {
                newData[fieldName] = accountNameToId[newData[fieldName]]
              }
            }
            else if (fieldName ==='owner') {
              if (newData[fieldName] in ownerNameToId) {
                newData[fieldName] = ownerNameToId[newData[fieldName]]
              }
            }
            if (newData[fieldName] === '') {
              newData[fieldName] = null;
            }
          })
          const newInvestment = new Investment(newData);
          updateInvestment(newInvestment).then(a => {
            if (a === 'duplicate key') {
              const electron = window.require('electron');
              const dialog = electron.remote.dialog
              let options  = {
               buttons: ["Ok"],
               message: 'Names and Long Names are unique!'
              }
              const confirmed = dialog.showMessageBoxSync(options)
              // const confirmed = window.confirm('Confirm Restore?')
              cell.restoreOldValue();
            }
          });
      };
    }
    return column;
  }
  else if (currencyColumns.includes(colName)) {
    const column = {title: colName,
      field: fieldName, responsive: 0, align: 'right', minWidth: 130,
      formatter: initialMoneyFormatter, headerTooltip: 'Right Click to toggle cents',
      headerContext: rightClickMoney};

    if (!readOnly) {
      column['cellEdited'] = function(cell) {
          const newData = cell.getData();
          Object.keys(newData).map(fieldName => {
            if (fieldName.includes('asset_class')) {
              if (newData[fieldName] in assetClassNameToId) {
                newData[fieldName] = assetClassNameToId[newData[fieldName]]
              }
            }
            else if (fieldName.includes('benchmark')) {
              if (newData[fieldName] in benchmarkNameToId) {
                newData[fieldName] = benchmarkNameToId[newData[fieldName]]
              }
            }
            else if (fieldName === 'account') {
              if (newData[fieldName] in accountNameToId) {
                newData[fieldName] = accountNameToId[newData[fieldName]]
              }
            }
            else if (fieldName ==='owner') {
              if (newData[fieldName] in ownerNameToId) {
                newData[fieldName] = ownerNameToId[newData[fieldName]]
              }
            }
            if (newData[fieldName] === '') {
              newData[fieldName] = null;
            }
          })
          const newInvestment = new Investment(newData);
          updateInvestment(newInvestment);
      };
      column['editor'] = "number";
    }
    return column;
  }
  else if (dateColumns.includes(colName)) {
    const column = {title: colName, field: fieldName, formatter:function(cell, formatterParams, onRendered){ const a = moment.utc(cell.getValue()).format('L'); if (a === 'Invalid date') {return ""}; return a;}, responsive: 0, minWidth: 200};
    column['sorter'] = function(a, b, aRow, bRow, column, dir, sorterParams){
      //a, b - the two values being compared
      //aRow, bRow - the row components for the values being compared (useful if you need to access additional fields in the row data for the sort)
      //column - the column component for the column being sorted
      //dir - the direction of the sort ("asc" or "desc")
      //sorterParams - sorterParams object from column definition array
      return myDateSort(a, b)
    }
    if (!readOnly) {
      column['editor'] = dateEditor;
      column['cellEdited'] = function(cell) {
          const newData = cell.getData();
          Object.keys(newData).map(fieldName => {
            if (fieldName.includes('asset_class')) {
              if (newData[fieldName] in assetClassNameToId) {
                newData[fieldName] = assetClassNameToId[newData[fieldName]]
              }
            }
            else if (fieldName.includes('benchmark')) {
              if (newData[fieldName] in benchmarkNameToId) {
                newData[fieldName] = benchmarkNameToId[newData[fieldName]]
              }
            }
            else if (fieldName === 'account') {
              if (newData[fieldName] in accountNameToId) {
                newData[fieldName] = accountNameToId[newData[fieldName]]
              }
            }
            else if (fieldName ==='owner') {
              if (newData[fieldName] in ownerNameToId) {
                newData[fieldName] = ownerNameToId[newData[fieldName]]
              }
            }
            if (newData[fieldName] === '') {
              newData[fieldName] = null;
            }
          })
          const newInvestment = new Investment(newData);
          updateInvestment(newInvestment);
      };
    }
    return column;
  }
  else if (!dropdownColumns.includes(colName)) {
    const column = {title: colName, field: fieldName, responsive: 0};
    if (!readOnly) {
      column['editor'] = true;
      column['cellEdited'] = function(cell) {
          const newData = cell.getData();
          Object.keys(newData).map(fieldName => {
            if (fieldName.includes('asset_class')) {
              if (newData[fieldName] in assetClassNameToId) {
                newData[fieldName] = assetClassNameToId[newData[fieldName]]
              }
            }
            else if (fieldName.includes('benchmark')) {
              if (newData[fieldName] in benchmarkNameToId) {
                newData[fieldName] = benchmarkNameToId[newData[fieldName]]
              }
            }
            else if (fieldName === 'account') {
              if (newData[fieldName] in accountNameToId) {
                newData[fieldName] = accountNameToId[newData[fieldName]]
              }
            }
            else if (fieldName ==='owner') {
              if (newData[fieldName] in ownerNameToId) {
                newData[fieldName] = ownerNameToId[newData[fieldName]]
              }
            }
            if (newData[fieldName] === '') {
              newData[fieldName] = null;
            }
          })

          const newInvestment = new Investment(newData);
          updateInvestment(newInvestment).then(a => {
            if (a === 'duplicate key') {
              const electron = window.require('electron');
              const dialog = electron.remote.dialog
              let options  = {
               buttons: ["Ok"],
               message: 'Names and Long Names are unique!'
              }
              const confirmed = dialog.showMessageBoxSync(options)
              // const confirmed = window.confirm('Confirm Restore?')
              cell.restoreOldValue();
            }
          });
      };
      column['editorParams'] = {
        showListOnEmpty:true,
        freetext: true,
        allowEmpty: true,
        searchingPlaceholder:"Filtering ...", //set the search placeholder
        values:true
      }
    }
    return column;
  }
  const column = {title: colName, field: fieldName, responsive: 0};

  if (!readOnly) {
    column['editor'] = 'autocomplete';
    column['cellEdited'] = function(cell) {
        const newData = cell.getData();

        Object.keys(newData).map(fieldName => {
          if (fieldName.includes('asset_class')) {
            if (newData[fieldName] in assetClassNameToId) {
              newData[fieldName] = assetClassNameToId[newData[fieldName]]
            }
          }
          else if (fieldName.includes('benchmark')) {
            if (newData[fieldName] in benchmarkNameToId) {
              newData[fieldName] = benchmarkNameToId[newData[fieldName]]
            }
          }
          else if (fieldName === 'account') {
            if (newData[fieldName] in accountNameToId) {
              newData[fieldName] = accountNameToId[newData[fieldName]]
            }
          }
          else if (fieldName ==='owner') {
            if (newData[fieldName] in ownerNameToId) {
              newData[fieldName] = ownerNameToId[newData[fieldName]]
            }
          }
          if (newData[fieldName] === '') {
            newData[fieldName] = null;
          }
        })

        const newInvestment = new Investment(newData);
        updateInvestment(newInvestment);
    };
    column['editorParams'] = {
      showListOnEmpty:true,
      freetext: false,
      allowEmpty: true,
      searchingPlaceholder:"Filtering ...", //set the search placeholder
      values:myValues(colName)
    }
  }
  return column;
}

// table class
const DetailInvestmentTable = (props) => {
  const InvestmentData = props.data;
  const readOnly = props.readOnly;

  const [tableData, setTableData] = useState(props.data);
  const [hasAdded, setHasAdded] = useState(false);

  const tableName = props.name;
  const columnNames = props.columns;
  const ref = useRef();

  accountNameToId = {}
  accountNames = props.AccountData.map(i => {
    accountNameToId[i.name] = i.id
    return i.name;
  })

  assetClassNameToId = {}
  assetClassNames = props.AssetClassData.map(i => {
    assetClassNameToId[i.name] = i.id
    return i.name;
  })

  benchmarkNameToId = {}
  benchmarkNames = props.BenchmarkData.map(i => {
    benchmarkNameToId[i.name] = i.id
    return i.name;
  })

  ownerNameToId = {}
  ownerNames = props.OwnerData.map(i => {
    ownerNameToId[i.name] = i.id
    return i.name;
  })

  console.log('render table!')

  let columns = columnNames.map((colName) => {
    return columnNameToDefintion(colName, readOnly);
  });


  const addButton = readOnly ? null : (
  <div style ={{float: "right", width: "130px", display: "inline-block"}}>
    <button type="button" onClick={() =>
      {
        const data = new Investment(null);
        insertInvestment(data).then((response) => {
          if (response === 'duplicate key') {
            let options  = {
             buttons: ["Ok"],
             message: 'Failed to insert! duplicate long_name; maybe an entry with a blank long name'
            }
            const confirmed = dialog.showMessageBoxSync(options)
            // alert('Failed to insert! duplicate long_name; maybe an entry with a blank long name')
            return;
          }
          ref.current.table.addData(response)
          setHasAdded(true);
        });
      }
      }
     id="myButton"
    className="btn btn-success btn-lg">Add Row</button>
  </div>);

  const copyButton = (<div style ={{float: "right", width: "130px", display: "inline-block"}}>
    <button type="button" onClick={() => { ref.current.table.download("csv", `${tableName}.csv`)}}
          className="btn btn-success btn-lg">Copy Data</button>
  </div>)

  if (readOnly) {
    columns = [eventsCol, ...columns];
  }
  if (hasAdded) {
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
       deleteInvestment(deletedData.id).then((result) => {
         if(result) {
           cell.getRow().delete();
         }
         else {
           let options  = {
            buttons: ["Ok"],
            message: 'Cannot delete investment. It likely has events.'
           }
           const confirmed = dialog.showMessageBoxSync(options)
           // alert('Cannot delete investment. It likely has events.')
         }
       })



    }};
    columns = [...columns, trashCol]
  }



  //add table holder element to DOM
  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
          <br />
          <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} </h1>
          {addButton}
          {copyButton}
          <br />
          <br />
      </div>
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={tableData}
        options={{...defaultTabulatorSettings,
        initialSort: [{column: "date_due", dir:'asc'}]}
        }
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );
}

export default DetailInvestmentTable;
