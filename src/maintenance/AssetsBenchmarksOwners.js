import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import Tabulator from "tabulator-tables"; //import Tabulator library

import {Owner, getOwners, insertOwner, updateOwner, deleteOwner} from '../serverAPI/owners';
import {Benchmark, getBenchmarks, insertBenchmark, updateBenchmark, deleteBenchmark} from '../serverAPI/benchmarks';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/bootstrap/tabulator_bootstrap.min.css"; // use Theme(s)

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

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

// settings I use across tables
const defaultTabulatorSettings = {
  movableRows: true,
  columnMinWidth:100,
  resizableColumns:false,
  layoutColumnsOnNewData:true
};

const MaintenanceTable = (props) => {
  const [tableData, setTableData] = useState(props.data);
  const columnNames = props.columns;
  const tableName = props.name;

  const doesAutocomplete = ['Asset Class', 'Account'].includes(tableName);

  const ref = useRef();


  let colNames = columnNames.map((colName) => {
    const fieldName = colName.toLowerCase().replace(' ', '_');
    if (doesAutocomplete) {
      return {title: colName, field: fieldName, responsive: 0, editor:"autocomplete",
              editorParams:{freetext: true, allowEmpty: true, values:true},
              cellEdited:function(cell) {
                const newData = cell.getData();
                if (tableName === 'Owner') {
                  const newOwner = new Owner(newData.id, newData.name, newData.long_name)
                  updateOwner(newOwner)
                }
                else if (tableName === 'Benchmark') {
                  const newBenchmark = new Benchmark(newData.id, newData.name)
                  console.log(newBenchmark)
                  console.log(newBenchmark.id)
                  updateBenchmark(newBenchmark)
                }
              }};
    }
    else {
      return {title: colName, field: fieldName, responsive: 0,
             editor:"input", cellEdited:function(cell) {
               const newData = cell.getData();
               if (tableName === 'Owner') {
                 const newOwner = new Owner(newData.id, newData.name, newData.long_name)
                 updateOwner(newOwner)
               }
               else if (tableName === 'Benchmark') {
                 const newBenchmark = new Benchmark(newData.id, newData.name)
                 console.log(newBenchmark.id)
                 updateBenchmark(newBenchmark)
               }
             }
          };
    }
  });

  useEffect(()=>{
    return (() => {
      setTableData(ref.current.table.getData())
    });
  }, [])

  const columns = [
    {rowHandle:true, formatter:"handle", headerSort:false,
      responsive:0, width:30, minWidth:30},
    ...colNames,
    {formatter:function(cell, formatterParams, onRendered){ //plain text value
         return "<i class='fa fa-trash'></i>";
     }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
       const deletedData = cell.getData();
       if (tableName === 'Owner') {
         deleteOwner(deletedData.id)
       }
       else if (tableName === 'Benchmark') {
         deleteBenchmark(deletedData.id)
       }

       cell.getRow().delete().then(function(){
            //run code after table has been successfuly updated
        })
        .catch(function(error){
        });;
    }}
  ];


  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
          <br />
          <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
          <div style ={{float: "right", width: "130px", display: "inline-block"}}>
            <button type="button" onClick={() =>
              {
                let newData = null;
                if (tableName === 'Owner') {
                  const newOwner = new Owner(null, "", "");
                  newData = newOwner.body();
                  insertOwner(newOwner);
                }
                else if (tableName === 'Benchmark') {
                  const newBenchmark = new Benchmark(null, "");
                  newData = newBenchmark.body();
                  insertBenchmark(newBenchmark);
                }
                console.log(newData)
                ref.current.table.addData(newData);
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

};



export default MaintenanceTable;
