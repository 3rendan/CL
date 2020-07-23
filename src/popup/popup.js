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
  if (inputValue === undefined || inputValue.length === 0) {
    return investmentOptions;
  }

  const a = investmentOptions.filter(i =>
    i.value.name.toLowerCase().includes(inputValue.toString().toLowerCase())
  );

  return a;
};

const filterCommitInvestmentOptions = (inputValue: string) => {
  const investments = filterInvestmentOptions(inputValue);
  return investments.filter(i => i.value.has_commitment);
};

const filterNonCommitInvestmentOptions = (inputValue: string) => {
  const investments = filterInvestmentOptions(inputValue);
  return investments.filter(i => !i.value.has_commitment);
};

const loadAllOptions = inputValue =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(filterInvestmentOptions(inputValue));
    }, 500);
  });

const loadCommitOptions = inputValue =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(filterCommitInvestmentOptions(inputValue));
    }, 500);
  });

const loadNonCommitOptions = inputValue =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve(filterNonCommitInvestmentOptions(inputValue));
    }, 500);
  });



const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const browserWindow  = electron.remote.BrowserWindow;

var senderWindow = null;
var senderWindowId = null;
var replyChannel = null;

ipcRenderer.on('popupMessage', (event, message) => {
  replyChannel = 'replyEvent';
  senderWindow = browserWindow.fromId(message.id);
  senderWindowId = senderWindow.webContents.id;
})

ipcRenderer.on('popupNAVMessage', (event, message) => {
  replyChannel = 'replyNAVEvent';
  senderWindow = browserWindow.fromId(message.id);
  senderWindowId = senderWindow.webContents.id;
})

ipcRenderer.on('popupTransferMessage', (event, message) => {
  replyChannel = 'replyTransfer';
  senderWindow = browserWindow.fromId(message.id);
  senderWindowId = senderWindow.webContents.id;
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
  const positiveTransactions = ['INFLOW', 'INT', 'DIV']
  const negativeTransactions = ['OUTFLOW']

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
    if (positiveTransactions.includes(props.transcationType) && e.target.value < 0) {
      alert('Amount must be positive!')
      e.target.value = 0;
      value = 0;
    }
    if (negativeTransactions.includes(props.transcationType) && e.target.value > 0) {
      alert('Amount must be negative!')
      e.target.value = 0;
      value = 0;
    }


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

  let loadOptions = loadAllOptions;
  if (props.transcationType === 'CONTRIBUTION' ||
      props.transcationType === 'DISTRIBUTION') {
    if (props.name === 'From Investment') {
      loadOptions = loadCommitOptions;
    }
    else if (props.name === 'Investment') {
      loadOptions = loadNonCommitOptions;
    }
  }

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
          props.state[props.name] = {label: label, value: data};
          props.setState(props.state)
        }
        return {label: label, value: data};
      })
      if (loadOptions === loadCommitOptions) {
        setDefaultOptions(investmentOptions.filter(i => i.value.has_commitment));
      }
      if (loadOptions === loadNonCommitOptions) {
        const nonCommit = investmentOptions.filter(i => !i.value.has_commitment)
        setDefaultOptions(nonCommit);
        setValue(nonCommit[0])
      }
      if (loadOptions === loadAllOptions) {
        setDefaultOptions(investmentOptions);
      }

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
        mainColumns = ['Date Due', 'Date Sent', 'Net Amount',
        'Main $', 'Fees $', 'Tax $',
        'Outside Main $', 'Outside Fees $', 'Outside Tax $',
         'Investment', 'From Investment', 'Notes'];
        passFunc = setNetAmount;
        break;
      case 'DISTRIBUTION':
        mainColumns = ['Date Due', 'Date Sent', 'Net Amount', 'Main $', 'Withhold $',	'Recallable $', 'Investment', 'From Investment', 'Notes'];
        passFunc = setNetAmount;
        break;
      case 'TRANSFER':
        mainColumns = ['Date', 'From Investment', 'To Investment', 'Amount', 'Notes'];
        break;
      case 'COMMISH':
        mainColumns = ['Date', 'Amount', 'Investment', 'From Investment', 'Notes']
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
                                key={column + transcationType} name={column} size={maxSize}
                                state={state} setState={setState}
                                transcationType={transcationType}/>;
         return a;
       }
       else if (column === 'Net Amount') {
         return <RowCurrencyNet netAmount={netAmount} key={column + transcationType}
                                name={column} size={maxSize}
                                state={state} setState={setState}/>;
       }
       else if (column.includes('Investment')) {
         return <RowInvestment name={column} key={column + transcationType} size={maxSize}
                                  state={state} setState={setState}
                                  investmentID={investmentID}
                                  transcationType={transcationType}/>
       }
       else {
         return <RowBland key={column + transcationType} name={column} size={maxSize}
                          state={state} setState={setState}/>;
       }
    });
    setRows(newRows);

  }, [transcationType, netAmount, state]);


  const onSubmit = () => {
    console.log(state);
    state['Type'] = transcationType;
    const newEvent = createEvent({
      state: state,
      netAmount: netAmount
    });
    console.log(senderWindowId)
    ipcRenderer.sendTo(senderWindowId, replyChannel, newEvent)
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
