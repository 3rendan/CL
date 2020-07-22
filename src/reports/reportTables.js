import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

// data and info
import "react-tabulator/lib/styles.css"; // default theme
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)

import 'font-awesome/css/font-awesome.css';

import {myMoneyFormatter, initialMoneyFormatter, rightClickMoney} from '../SpecialColumn';

// for React 16.4.x use: import { ReactTabulator } - example in github repo.
import { React15Tabulator, reactFormatter } from "react-tabulator"; // for React 15.x


const MaintenanceTable = (props) => {
  const columnNames = props.columns;
  const tableName = props.name;
  const [data, setData] = useState([]);

  useEffect(() => {
    async function fetchInvestments() {
      setData(props.data);
    }
    fetchInvestments();
  }, [])


  const ref = useRef();

  let columns = columnNames.map((colName) => {
    const frozen = props.frozenColumns ? props.frozenColumns.includes(colName) : false;
    let fieldName = colName.toLowerCase().replace(new RegExp(' ', 'g'), '_');
    if (props.moneyColumns !== undefined && props.moneyColumns.includes(colName)) {
      const column = {title: colName +' $',
        field: fieldName, responsive: 0, minWidth: 150,
        formatter: initialMoneyFormatter, headerTooltip: 'Right Click to toggle cents',
        headerSort:false, sorter:'number',
        headerContext:rightClickMoney};
      return column;
    }
    return {title: colName, field: fieldName, responsive: 0,
            sorter: 'string', headerSort:false, frozen: frozen};
  });


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
                  initialSort: [{column: "date_due", dir:'asc'}]}}
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );

};



export default MaintenanceTable;
