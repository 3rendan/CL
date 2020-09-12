import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';

import {Owner, insertOwner, updateOwner, deleteOwner} from '../serverAPI/owners';
import {Benchmark, insertBenchmark, updateBenchmark, deleteBenchmark} from '../serverAPI/benchmarks';
import {AssetClass, getAssetClasss, insertAssetClass, updateAssetClass, deleteAssetClass} from '../serverAPI/assetClass';
import {Account, insertAccount, updateAccount, deleteAccount} from '../serverAPI/accounts';

import 'font-awesome/css/font-awesome.css';
import '../centerHeaders.css';
import '../shrinkFontSize.css';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

// settings I use across tables
import {defaultTabulatorSettings, copyCol} from '../SpecialColumn';

const electron = window.require('electron');
const dialog = electron.remote.dialog

const MaintenanceTable = (props) => {
  const tableData = props.data;
  const columnNames = props.columns;
  const tableName = props.name;

  const ref = useRef();

  const columns = [
    // {rowHandle:true, formatter:"handle", headerSort:false,
    //   responsive:0, width:30, minWidth:30},
    ...props.colNames,
    {formatter:function(cell, formatterParams, onRendered){ //plain text value
         return "<i class='fa fa-trash'></i>";
     }, minWidth: 40, width:40, headerSort:false, responsive:0, hozAlign:"center", cellClick:function(e, cell){
       let options  = {
        buttons: ["Yes","No"],
        message: 'Confirm Delete?'
       }
       const confirmed = dialog.showMessageBoxSync(options);
       // const confirmed = window.confirm('Confirm Delete?')
       if (confirmed === 1) {
         return;
       }

       const deletedData = cell.getData();
       if (tableName === 'Owners') {
         deleteOwner(deletedData.id).then(a => {
           if (a === 'foreign key') {
             const electron = window.require('electron');
             const dialog = electron.remote.dialog
             let options  = {
              buttons: ["Ok"],
              message: 'Cannot delete, something depends on this!'
             }
             const confirmed = dialog.showMessageBoxSync(options)
             // const confirmed = window.confirm('Confirm Restore?')
           }
           else {
             cell.getRow().delete();
           }
         });
       }
       else if (tableName === 'Benchmarks') {
         deleteBenchmark(deletedData.id).then(a => {
           if (a === 'foreign key') {
             const electron = window.require('electron');
             const dialog = electron.remote.dialog
             let options  = {
              buttons: ["Ok"],
              message: 'Cannot delete, something depends on this!'
             }
             const confirmed = dialog.showMessageBoxSync(options)
             // const confirmed = window.confirm('Confirm Restore?')
           }
           else {
             cell.getRow().delete();
           }
         });
       }
       else if (tableName === 'Asset Classes') {
         deleteAssetClass(deletedData.id).then(a => {
           if (a === 'foreign key') {
             const electron = window.require('electron');
             const dialog = electron.remote.dialog
             let options  = {
              buttons: ["Ok"],
              message: 'Cannot delete, something depends on this!'
             }
             const confirmed = dialog.showMessageBoxSync(options)
             // const confirmed = window.confirm('Confirm Restore?')
           }
           else {
             cell.getRow().delete();
           }
         });
       }
       else if (tableName === 'Accounts') {
         deleteAccount(deletedData.id).then(a => {
           if (a === 'foreign key') {
             const electron = window.require('electron');
             const dialog = electron.remote.dialog
             let options  = {
              buttons: ["Ok"],
              message: 'Cannot delete, something depends on this!'
             }
             const confirmed = dialog.showMessageBoxSync(options)
             // const confirmed = window.confirm('Confirm Restore?')
           }
           else {
             cell.getRow().delete();
           }
         });
       }

    }}
  ];

  const copyButton = (<div style ={{float: "right", width: "130px", display: "inline-block"}}>
    <button type="button" onClick={() => { ref.current.table.download("csv", `${tableName} Data.csv`)}}
          className="btn btn-success btn-lg">Copy Data</button>
  </div>)

  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
        <br />
        <h1 style = {{ margin: 0, marginLeft: '40%', display: "inline-block"}}> {tableName} </h1>
        <div style ={{float: "right", width: "130px", display: "inline-block"}}>
          <button type="button" onClick={() =>
            {
              let insertFunc = null;
              let data = null;
              if (tableName === 'Owners') {
                insertFunc = insertOwner;
                data = new Owner(null);
              }
              else if (tableName === 'Benchmarks') {
                data = new Benchmark(null);
                insertFunc = insertBenchmark;
              }
              else if (tableName === 'Asset Classes') {
                data = new AssetClass(null);
                insertFunc = insertAssetClass;
              }
              else if (tableName === 'Accounts') {
                insertFunc = insertAccount;
                data = new Account(null);
              }
              insertFunc(data).then((response) => {
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
              })
            }
           }
           id="myButton"
          className="btn btn-success btn-lg">Add Row</button>
        </div>
        {copyButton}
        <br />
        <br />
      </div>
      <br />
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
