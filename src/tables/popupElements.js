import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from "react-dom";

import AsyncSelect from 'react-select/async';
import Dropdown from 'react-bootstrap/Dropdown';
import {getInvestments} from '../serverAPI/investments.js'

var InvestmentData = [];
var investmentOptions = [];

async function fetchData() {
  InvestmentData = await getInvestments();
  investmentOptions = InvestmentData.map((data) => {
    const label = data.long_name
    return {label: label, value: data};
  })
}
fetchData();

const electron = window.require('electron');
const dialog = electron.remote.dialog

const BenchmarkDropdown = (props) => {
  const setSelected = props.setSelected;
  const defaultTitleText = 'Choose Benchmark...' ;
  const setTransactionType = props.setTransactionType;

  const [titleText, setTitleText] = useState(defaultTitleText);
  const myTitle = <div> {titleText} <span style={{borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent", borderTop: "8px solid #FFFFFF"}} className="caret"></span> </div>;

  const selectOption = (e) => {
    setSelected(true);
    setTitleText(e.target.innerText);
    if (setTransactionType != null) {
        setTransactionType(e.target.innerText);
    }

  }

  const itemStyle = {fontSize: "15pt", display: 'inherit', textAlign: 'center'};

  const dropdownOptions = props.dropdownOptions;
  const dropdownItems = dropdownOptions.map((option) => {
    return (<div key={option}> <Dropdown.Item style={itemStyle} onClick={selectOption.bind(this)}>{option}</Dropdown.Item>
            <Dropdown.Divider/> </div>
          );
  });

  return (
    <Dropdown>
      <Dropdown.Toggle variant="success" id="dropdown-basic" style={{width: "40%", 'fontSize': '20pt'}}>
        {myTitle}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{width: "40%", display: 'inline-block'}}>
        {dropdownItems}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export {
  BenchmarkDropdown
}
