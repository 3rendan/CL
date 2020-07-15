import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom";


import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';

import {createEvent} from '../serverAPI/eventsAndTransfers'

import AsyncSelect from 'react-select/async';

import {getInvestments} from '../serverAPI/investments.js'
var InvestmentData = [];
var investmentOptions = [];

async function fetchData() {
  InvestmentData = await getInvestments();
  investmentOptions = InvestmentData.map((data) => {
    const label = data.long_name + " " + data.account + " " + data.owner + " " + data.commitment
    return {label: label, value: data};
  })
}
fetchData();


const filterInvestmentOptions = (inputValue: string) => {
  console.log(investmentOptions)
  if (inputValue === undefined || inputValue === null || inputValue.length === 0) {
    return investmentOptions;
  }
  const a = investmentOptions.filter(i =>
    i.value.name.toLowerCase().includes(inputValue.toLowerCase())
  );
  console.log(a)
  return a;
};


const loadOptions = inputValue =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(filterInvestmentOptions(inputValue));
    }, 500);
  });




const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const browserWindow  = electron.remote.BrowserWindow;

var senderWindow = null;
var replyChannel = null;

ipcRenderer.on('popupMessage', (event, message) => {
  replyChannel = 'replyEvent';
  senderWindow = browserWindow.fromId(message.id);
})

ipcRenderer.on('popupNAVMessage', (event, message) => {
  replyChannel = 'replyNAVEvent';
  senderWindow = browserWindow.fromId(message.id);
})

ipcRenderer.on('popupTransferMessage', (event, message) => {
  replyChannel = 'replyTransfer';
  senderWindow = browserWindow.fromId(message.id);
})

const RowCurrencyNet = (props) => {
  let currency = 'USD';

  const value = props.netAmount;
  const min = 0;

  function localStringToNumber( s ){
    return Number(String(s).replace(/[^0-9.-]+/g,""))
  }


  var options = {
      maximumFractionDigits : 2,
      currency              : currency,
      style                 : "currency",
      currencyDisplay       : "symbol"
  };

  const size = props.size * 10 + "px";

  return (
    <div className="input-group" style={{width: "90%", paddingBottom: '10px', paddingLeft: '5px'}}>
        <span style={{width: size}} className="input-group-addon" id={props.name}>{props.name}</span>
        <input readOnly type={'currency'} min={min}
               value={localStringToNumber(value).toLocaleString(undefined, options)}
               className="form-control"  />
    </div>
  );
};

const RowCurrency = (props) => {
  let placeholder = props.name;
  let currency = 'USD';

  const [currMoney, setCurrMoney] = useState(0);

  const min = 0;

  function localStringToNumber( s ){
    return Number(String(s).replace(/[^0-9.-]+/g,""))
  }

  function onFocus(e){
    var value = e.target.value;
    e.target.value = value ? localStringToNumber(value) : ''
  }

  function onBlur(e){
    var value = e.target.value;

    var options = {
        maximumFractionDigits : 2,
        currency              : currency,
        style                 : "currency",
        currencyDisplay       : "symbol"
    };

    e.target.value = value
      ? localStringToNumber(value).toLocaleString(undefined, options)
      : '';


    if (props.setNetAmount != null) {
      props.setNetAmount(props.netAmount + localStringToNumber(value) - currMoney);
    }
    setCurrMoney(localStringToNumber(value));

    props.state[props.name] = value;
    props.setState(props.state);

  }

  const size = props.size * 10 + "px";

  placeholder = "Enter ".concat(placeholder.toLowerCase());


  return (
    <div className="input-group" style={{width: "90%", paddingBottom: '10px', paddingLeft: '5px'}}>
        <span style={{width: size}} className="input-group-addon"
              id={props.name}>{props.name}</span>
        <input type={'currency'} onFocus={onFocus.bind(this)}
                onBlur={onBlur.bind(this)} min={min}
                className="form-control" placeholder={placeholder} required/>
    </div>
  );
};

const RowInvestment = (props) => {
  const [defaultOptions, setDefaultOptions] = useState(investmentOptions);
  const defaultInvestment = props.investmentID;
  const [value, setValue] = useState(null);

  const onChange = (inputText) => {
    props.state[props.name] = inputText;
    props.setState(props.state)
    setValue(inputText)
  }

  const size = props.size * 10 + "px";

  useEffect(() => {
    async function fetchData() {
      InvestmentData = await getInvestments();
      investmentOptions = InvestmentData.map((data) => {
        const label = data.long_name + " " + data.account + " " + data.owner + " " + data.commitment
        if (data.id === defaultInvestment) {
          setValue({label: label, value: data})
        }
        return {label: label, value: data};
      })
      setDefaultOptions(investmentOptions);
    }
    fetchData();
  }, [])

  return (
    <div className="input-group" style={{width: "90%", paddingBottom: '10px', paddingLeft: '5px'}}>
        <span style={{width: size}} className="input-group-addon" id={props.name}>{props.name}</span>
        <AsyncSelect
          cacheOptions
          styles={{
            // Fixes the overlapping problem of the component
            menu: provided => ({ ...provided, zIndex: 9999 })
          }}
          loadOptions={loadOptions}
          defaultOptions={defaultOptions}
          value={value}
          onChange={onChange.bind(this)}
          required={true}
        />
    </div>
  );
};

const RowBland = (props) => {
  let placeholder = props.name;

  let type = "";
  let min = null;
  if (props.name.includes("Date")) {
    type = "date";
  }
  else if (props.name.includes("Amount")) {
    type = "number";
    min = "0";
  }
  else {
    type="text";
  }


  const onChange = (e) => {
    props.state[props.name] = e.target.value;
    props.setState(props.state)
  }

  const size = props.size * 10 + "px";

  placeholder = "Enter ".concat(placeholder.toLowerCase());


  return (
    <div className="input-group" style={{width: "90%", paddingBottom: '10px', paddingLeft: '5px'}}>
        <span style={{width: size}} className="input-group-addon" id={props.name}>{props.name}</span>
        <input type={type} min={min} onChange={onChange.bind(this)} className="form-control" placeholder={placeholder} required />
    </div>
  );
};

const FormSheet = (props) => {
  const [InvestmentData, setInvestmentData] = useState(null);
  const getInvestmentData = props.getInvestmentData;

  const isSelected = props.transcationType !== undefined;
  const [hasSelected, setSelected] = useState(isSelected);
  const [transcationType, setTranscationType] = useState(props.transcationType);
  const [rows, setRows] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState(props.dropdownOptions)

  const investmentID = props.investmentID;

  const [state, setState] = useState({});

  const [netAmount, setNetAmount] = useState(0.0);

  useEffect(()=> {
    async function fetchData() {
      const result = await getInvestmentData();
      setInvestmentData(result);
    }
    fetchData();

    let mainColumns = null;
    let passFunc = null;
    switch (transcationType) {
      case 'CONTRIBUTION':
        mainColumns = ['Date Due', 'Date Sent', 'Net Amount', 'Fees $',	'Tax $',	'Outside $', 'Other $', 'From Investment', 'Notes'];
        passFunc = setNetAmount;
        break;
      case 'DISTRIBUTION':
        mainColumns = ['Date Due', 'Date Sent', 'Net Amount', 'Withhold $',	'Recallable $',	'Other $', 'From Investment', 'Notes'];
        passFunc = setNetAmount;
        break;
      case 'TRANSFER':
        mainColumns = ['Date', 'From Investment', 'To Investment', 'Amount', 'Notes'];
        break;
      default: // single entry transaction details
        mainColumns = ['Date', 'Investment', 'Amount', 'Notes'];
    }

    const mainLengths = mainColumns.map((a) => { return a.length });
    const maxSize = mainLengths.reduce((a, b) => {
        return Math.max(a, b);
    });


    const newRows = mainColumns.map((column) => {
       if (column === 'Amount' || column.includes('$')) {
         const a = <RowCurrency netAmount={netAmount} setNetAmount={passFunc}
                                key={column} name={column} size={maxSize}
                                state={state} setState={setState}/>;
         return a;
       }
       else if (column === 'Net Amount') {
         return <RowCurrencyNet netAmount={netAmount} key={column}
                                name={column} size={maxSize}
                                state={state} setState={setState}/>;
       }
       else if (column.includes('Investment')) {
         return <RowInvestment name={column} key={column} size={maxSize}
                                  state={state} setState={setState}
                                  investmentID={investmentID}/>
       }
       else {
         return <RowBland key={column} name={column} size={maxSize}
                          state={state} setState={setState}/>;
       }
    });
    setRows(newRows);

  }, [transcationType, netAmount, state]);


  const onSubmit = () => {
    console.log(state);
    state['Type'] = transcationType;
    if (state.Type === 'DISTRIBUTION') {
      replyChannel = 'replyDistribution'
    }
    else if (state.Type === 'CONTRIBUTION') {
      replyChannel = 'replyContribution'
    }
    createEvent({
      state: state,
      netAmount: netAmount
    });
    senderWindow.webContents.send(replyChannel, state)
  };


  return (
     <div>
       <MyDropdown dropdownOptions={dropdownOptions}
                   setSelected={setSelected}
                   transcationType={transcationType}
                   setTranscationType={setTranscationType}/>
       <br />
       <form style={{visibility: hasSelected ? 'visible' : 'hidden'}}
              onSubmit={onSubmit}>
         {rows}
         <input id="submitForm" type="submit" />
       </form>
     </div>
  );
}

const MyDropdown = (props) => {
  const setSelected = props.setSelected;
  const defaultTitleText = props.transcationType ? props.transcationType : 'Choose...' ;
  const setTranscationType = props.setTranscationType;

  const [titleText, setTitleText] = useState(defaultTitleText);
  const myTitle = <div> {titleText} <span style={{borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent", borderTop: "8px solid #FFFFFF"}} className="caret"></span> </div>;

  const selectOption = (e) => {
    setSelected(true);
    setTitleText(e.target.innerText);
    setTranscationType(e.target.innerText);
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
      <Dropdown.Toggle variant="success" id="dropdown-basic" style={{width: "100%", 'fontSize': '20pt'}}>
        {myTitle}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{width: "100%", display: 'inline-block'}}>
        {dropdownItems}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default FormSheet;
