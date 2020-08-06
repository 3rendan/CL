import React, {Fragment, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

import 'font-awesome/css/font-awesome.css';
import '../centerHeaders.css';

import {initialMoneyPercentFormatter, rightClickMoneyPercent} from '../SpecialColumn';

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
  }, [])




  let columns = columnNames.map((colName) => {
    const frozen = props.frozenColumns ? props.frozenColumns.includes(colName) : false;
    let fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (props.moneyColumns !== undefined && props.moneyColumns.includes(colName)) {
      const column = {title: colName, align: 'right',
        field: fieldName, responsive: 0, minWidth: 150,
        formatter: initialMoneyPercentFormatter, headerTooltip: 'Right Click to toggle cents',
        headerSort:false, sorter:'number',
        headerContext:rightClickMoneyPercent};
      return column;
    }
    return {title: colName, field: fieldName, responsive: 0,
            sorter: 'string', headerSort:false, frozen: frozen};
  });

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (data === null) {
    return <h1> Loading Summary Table... </h1>
  }
  return (
    <div>
      <br />
      <h1 style = {{ margin: 0, display: "inline-block"}}> {tableName} Table </h1>
      <br />
      <br />
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={data}
        options={{layout: "fitData",
                  scrollToColumnPosition: "right",
                  dataTree: true,
                  maxHeight: parseInt(remote.getCurrentWindow().getSize()[1] * 0.9) + 'px',
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
                    // Accont Balance
                    if(["Total NAV"].includes(data.account)){
                        row.getElement().style.fontWeight = "bold"; //apply css change to row element
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
