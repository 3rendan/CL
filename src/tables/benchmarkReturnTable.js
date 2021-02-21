import React, {Fragment, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

import 'font-awesome/css/font-awesome.css';
import '../centerHeaders.css';
import '../shrinkFontSize.css';

import {initialMoneyPercentFormatter, rightClickMoneyPercent, reportColumnSort} from '../SpecialColumn';

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x

const electron = window.require('electron');
const remote   = electron.remote;
const ipcRenderer  = electron.ipcRenderer;

const path = require('path');

// Importing dialog module using remote
const dialog = remote.dialog;
const fs = require('fs');


const MaintenanceTable = (props) => {
  const [error, setError] = useState(null);
  const sumColumns = props.sumColumns !== undefined;

  const columns = props.colNames;
  const tableName = props.name;
  const [data, setData] = useState(null);

  const ref = useRef();

  const copyButton = (<div style ={{float: "right", width: "130px", display: "inline-block"}}>
    <button type="button" onClick={() => { ref.current.table.download("csv", `${tableName}.csv`) }}
          className="btn btn-success btn-lg">Copy Data</button>
  </div>);


  const onClick = (filepath) => {
    console.log('filepath')
    console.log(filepath)
    dialog.showOpenDialog({
        title: 'Select the File to be uploaded',
        defaultPath: path.join(__dirname, '../assets/'),
        buttonLabel: 'Upload',
        // Restricting the user to only Text Files.
        filters: [
            {
                name: 'Text Files',
                extensions: ['txt', 'docx']
            }, ],
        // Specifying the File Selector Property
        properties: ['openFile']
    }).then(file => {
      if (!file.canceled) {
        // Updating the GLOBAL filepath variable
        // to user-selected file.
        global.filepath = file.filePaths[0].toString();
        console.log(global.filepath)
        ipcRenderer.send('readFile', global.filepath);
      }
    });
    }

  const addButton = <div style ={{float: "right", width: "130px", display: "inline-block"}}>
    <button className="btn btn-success btn-lg" onClick={(event) => {onClick(event.target.value)}}> Upload File </button>
  </div>;

  useEffect(() => {
    console.log(addButton);
    async function fetchInvestments() {
      setData(props.data);
    }
    fetchInvestments().catch(e => setError(e))
  }, [props.data, addButton]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (data === null) {
    return <h1> Loading Summary Table... </h1>
  }

  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
        <h1 style = {{margin: 0, marginLeft: props.date ? '10%' : '25%', display: "inline-block"}}> {tableName} Table </h1>
        <br />
        {addButton}
        {copyButton}
        <br />
        <br />
      </div>
      <br />
      <br />
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={data}
        options={{layout: "fitData",
                  dataTree: true,
                  downloadDataFormatter: (data) => data,
                  downloadReady: (fileContents, blob) => blob,
                  maxHeight: parseInt(remote.getCurrentWindow().getSize()[1] * 0.7) + 'px',
                  initialSort: [{column: "date_due", dir:'asc'},
                                {column: "name", dir:'asc'}],
                  rowFormatter:function(row){
                    //row - row component
                    let data = row.getData();
                    if(["Total NAV", 'Gain ($)', 'Gain (%)'].includes(data.investment)){
                        row.getElement().style.fontWeight = "bold"; //apply css change to row element
                    }
                    // asset allocation report
                    if(["Total NAV"].includes(data.asset)){
                        row.getElement().style.fontWeight = "bold"; //apply css change to row element
                    }
                    // owner nav report
                    if(["Total NAV"].includes(data.owner)){
                        row.getElement().style.fontWeight = "bold"; //apply css change to row element
                    }
                    // Accont Balance
                    if(["Total NAV"].includes(data.account)){
                        row.getElement().style.fontWeight = "bold"; //apply css change to row element
                    }
                    if (tableName === 'Investment NAV') {
                      if (!isNaN(data['nav']) && data['nav'] < 0) { // if it is a negative number
                        row.getCell('nav').getElement().style.color = 'red';
                      }
                    }
                  }
            }}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );

};



export default MaintenanceTable;
