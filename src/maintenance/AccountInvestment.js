import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import {myMoneyFormatter, eventsCol, defaultTabulatorSettings,
        myDateSort,
        rightClickMoney, initialMoneyFormatter} from '../SpecialColumn';

import moment from 'moment';


import {Investment, updateInvestment, insertInvestment, colToInvestmentFields} from '../serverAPI/investments.js'

import 'font-awesome/css/font-awesome.css';
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)


import { React15Tabulator } from "react-tabulator"; // for React 15.x

window.moment = moment;

const textColumns = ['Management Fee',	'Preferred Return',	'Carried Interest',
                    'Sponsor Investment',	'Notes'];

const currencyColumns = ['Commitment',	'Size (M)'];
const dateColumns = ['End of Term', 'Close Date'];
const dropdownColumns = ['Primary Benchmark', 'Secondary Benchmark',
                  'Asset Class', 'Sub Asset Class', 'Account', 'Owner']

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
const myValues = function(colName, dataDictionary) {
  const AssetClassData = dataDictionary['AssetClassData'];
  const BenchmarkData = dataDictionary['BenchmarkData'];
  const AccountData = dataDictionary['AccountData'];
  const OwnerData = dataDictionary['OwnerData'];


  if (colName.includes('Asset Class')) {
    return AssetClassData.map(i => i.name);
  }
  else if (colName.includes('Benchmark')) {
    return BenchmarkData.map(i => i.name);
  }
  else if (colName === 'Account') {
    return AccountData.map(i => i.name);
  }
  else if (colName ==='Owner') {
    return OwnerData.map(i => i.name);
  }
  else {
    return true;
  }
};

function columnNameToDefintion(colName, readOnly, dataDictionary, setPrecision) {
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
          const newInvestment = new Investment(newData);
          console.log(newInvestment)
          console.log('try update')
          updateInvestment(newInvestment);
      };
    }
    return column;
  }
  else if (currencyColumns.includes(colName)) {
    const column = {title: colName,
      field: fieldName, responsive: 0,
      formatter: initialMoneyFormatter, headerTooltip: 'Right Click to toggle cents',
      headerContext: rightClickMoney};

    if (!readOnly) {
      column['cellEdited'] = function(cell) {
          const newData = cell.getData();
          console.log(newData)
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
          const newInvestment = new Investment(newData);
          updateInvestment(newInvestment);
      };
    }
    return column;
  }
  else if (!dropdownColumns.includes(colName)) {
    const column = {title: colName, field: fieldName, responsive: 0,
                    editor: true};
    if (!readOnly) {
      column['cellEdited'] = function(cell) {
          const newData = cell.getData();
          const newInvestment = new Investment(newData);
          console.log(newInvestment)
          console.log('update!')
          updateInvestment(newInvestment);
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
        const newInvestment = new Investment(newData);
        console.log(newInvestment)
        console.log('update!')
        updateInvestment(newInvestment);
    };
    column['editorParams'] = {
      showListOnEmpty:true,
      freetext: false,
      allowEmpty: true,
      searchingPlaceholder:"Filtering ...", //set the search placeholder
      values:myValues(colName, dataDictionary)
    }
  }
  return column;
}

// table class
const DetailInvestmentTable = (props) => {
  const InvestmentData = props.data;
  const readOnly = props.readOnly;

  const [tableData, setTableData] = useState(props.data);
  const tableName = props.name;
  const columnNames = props.columns;
  const ref = useRef();


  const dataDictionary = {
    AccountData: props.AccountData,
    OwnerData: props.OwnerData,
    AssetClassData: props.AssetClassData,
    BenchmarkData: props.BenchmarkData,
  };

  console.log(props.data)


  let columns = columnNames.map((colName) => {
    return columnNameToDefintion(colName, readOnly, dataDictionary);
  });

  console.log(columns)

  const addButton = readOnly ? null : (
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
  </div>);

  if (readOnly) {
    columns = [eventsCol, ...columns];
  }



  //add table holder element to DOM
  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
          <br />
          <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
          {addButton}
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
