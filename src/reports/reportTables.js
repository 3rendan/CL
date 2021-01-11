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

const MaintenanceTable = (props) => {
  const [error, setError] = useState(null);
  const sumColumns = props.sumColumns !== undefined;

  const columnNames = props.columns;
  const tableName = props.name;
  const [data, setData] = useState(null);

  const ref = useRef();

  useEffect(() => {
    async function fetchInvestments() {
      setData(props.data);
    }
    fetchInvestments().catch(e => setError(e))
    // console.log(ref.current.table)
    // ref.current.table.scrollToColumn(props.scrollTo, "middle", false).then(function() {
    //   console.log('here')
    // })
  }, [props.data])


  let columns = columnNames.map((colName) => {
    const frozen = props.frozenColumns ? props.frozenColumns.includes(colName) : false;
    let fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (props.moneyColumns !== undefined && props.moneyColumns.includes(colName)) {
      let minWidth = 130;
      if (tableName === 'Investment NAV' && colName === 'NAV (%)') {
        minWidth = 100;
      }
      else if (tableName === 'Investment NAV' && colName === 'Remaining Commitment') {
        minWidth = 110;
      }
      const column = {title: colName, align: 'right',
        field: fieldName, responsive: 0, minWidth: minWidth,
        formatter: initialMoneyPercentFormatter, headerTooltip: 'Right Click to toggle cents',
        headerSort:true, sorter:'number',
        headerContext:rightClickMoneyPercent};
      return column;
    }
    if (tableName.includes('Summary')) {
      // minWidth of investment column of Summary Tables
      return {title: colName, field: fieldName, responsive: 0, minWidth: 300,
              sorter: 'string', headerSort:true, frozen: frozen};
    }
    else if (tableName === 'Asset NAV') {
      // AssetNAV double size of Asset
      return {title: colName, field: fieldName, responsive: 0, minWidth: 200,
              sorter: reportColumnSort, headerSort:true, frozen: frozen};
    }
    else if (tableName === 'Investment NAV') {
      let minWidth = 250; // Investment
      if (colName === 'Account') {
        minWidth = 280;
      }
      else if (colName === 'Owner') {
        minWidth = 160;
      }
      // NAV% 25% shorter
      return {title: colName, field: fieldName, responsive: 0, minWidth: minWidth,
              sorter: reportColumnSort, headerSort:true, frozen: frozen};
    }
    return {title: colName, field: fieldName, responsive: 0,
            sorter: reportColumnSort, headerSort:true, frozen: frozen};
  });

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (data === null) {
    return <h1> Loading Summary Table... </h1>
  }

  const copyButton = (<div style ={{float: "right", width: "130px", display: "inline-block"}}>
    <button type="button" onClick={() => { ref.current.table.download("csv", `${tableName}.csv`) }}
          className="btn btn-success btn-lg">Copy Data</button>
  </div>)

  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
        <br />
        <h1 style = {{margin: 0, marginLeft: '40%', display: "inline-block"}}> {tableName} Table </h1>
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
