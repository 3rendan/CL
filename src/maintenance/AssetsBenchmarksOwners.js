import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import {Owner, insertOwner, updateOwner, deleteOwner} from '../serverAPI/owners';
import {Benchmark, insertBenchmark, updateBenchmark, deleteBenchmark} from '../serverAPI/benchmarks';
import {AssetClass, getAssetClasss, insertAssetClass, updateAssetClass, deleteAssetClass} from '../serverAPI/assetClass';
import {Account, insertAccount, updateAccount, deleteAccount} from '../serverAPI/accounts';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

// settings I use across tables
import {defaultTabulatorSettings} from '../SpecialColumn';

const MaintenanceTable = (props) => {
  const tableData = props.data;
  const columnNames = props.columns;
  const tableName = props.name;

  const ref = useRef();

  const columns = [
    {rowHandle:true, formatter:"handle", headerSort:false,
      responsive:0, width:30, minWidth:30},
    ...props.colNames,
    {formatter:function(cell, formatterParams, onRendered){ //plain text value
         return "<i class='fa fa-trash'></i>";
     }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
       const confirmed = window.confirm('Confirm Delete?')
       if (!confirmed) {
         return;
       }
       const deletedData = cell.getData();
       if (tableName === 'Owner') {
         deleteOwner(deletedData.id)
       }
       else if (tableName === 'Benchmark') {
         deleteBenchmark(deletedData.id)
       }
       else if (tableName === 'Asset Class') {
         deleteAssetClass(deletedData.id)
       }
       else if (tableName === 'Account') {
         deleteAccount(deletedData.id)
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
            <button type="button" onClick={() =>
              {
                let insertFunc = null;
                let data = null;
                if (tableName === 'Owner') {
                  insertFunc = insertOwner;
                  data = new Owner(null);
                }
                else if (tableName === 'Benchmark') {
                  data = new Benchmark(null);
                  insertFunc = insertBenchmark;
                }
                else if (tableName === 'Asset Class') {
                  data = new AssetClass(null);
                  insertFunc = insertAssetClass;
                }
                else if (tableName === 'Account') {
                  insertFunc = insertAccount;
                  data = new Account(null);
                }
                insertFunc(data).then((response) => {
                  console.log(response)
                  ref.current.table.addData(response)
                })
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
