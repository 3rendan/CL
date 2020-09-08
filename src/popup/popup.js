import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from "react-dom";

import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';

import {createEvent, updateEvent} from '../serverAPI/eventsAndTransfers'

import AsyncSelect from 'react-select/async';

import {getContributionsId} from '../serverAPI/contributions.js'
import {getDistributionsId} from '../serverAPI/distributions.js'
import {getCommissionsId} from '../serverAPI/commissions.js'
import {getTransfersId} from '../serverAPI/transfers.js'
import {getSingleEntry} from '../serverAPI/singleEntry.js'


import {getInvestments} from '../serverAPI/investments.js'
const electron = window.require('electron');
const dialog = electron.remote.dialog
const remote = electron.remote;

const positiveTransactions = ['INFLOW', 'CREDIT', 'INT', 'DIV']
const negativeTransactions = ['OUTFLOW', 'EXPENSE']



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


// const electron       = window.require('electron');
const ipcRenderer    = electron.ipcRenderer;
const browserWindow  = electron.remote.BrowserWindow;

var senderWindow    = null;
var senderWindowId  = null;
var replyChannel    = null;


const RowCurrencyNet = (props) => {
  let currency = 'USD';

  const value = props.state[props.name] ? props.state[props.name] : props.netAmount;

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
        <input readOnly type={'currency'}
               value={localStringToNumber(value).toLocaleString(undefined, options)}
               className="form-control"  />
    </div>
  );
};

const RowCurrency = (props) => {
  let placeholder = props.name;
  let currency = 'USD';

  const [currMoney, setCurrMoney] = useState(props.state[props.name] ? props.state[props.name] : 0);

  let defaultValue = null;
  var options = {
      maximumFractionDigits : 2,
      currency              : currency,
      style                 : "currency",
      currencyDisplay       : "symbol"
  };

  defaultValue = localStringToNumber(currMoney).toLocaleString(undefined, options);

  function localStringToNumber( s ){
    return Number(String(s).replace(/[^0-9.-]+/g,""))
  }

  function onFocus(e) {
    var value = e.target.value;
    e.target.value = value ? localStringToNumber(value) : ''
  }

  function onChange(e) {
    var value = e.target.value;
    const valAsNumber = localStringToNumber(value)
    if (isNaN(valAsNumber)) {
      return;
    }
    props.setState(state => {
      const newState = {...state}
      console.log(valAsNumber)
      newState[props.name] =  valAsNumber
      if (newState['Net Amount'] !== undefined && props.name !== 'Withhold $') {
        if (currMoney === undefined) {
          newState['Net Amount'] = newState['Net Amount'] + valAsNumber
        }
        else {
          newState['Net Amount'] = newState['Net Amount'] + valAsNumber - currMoney
        }

      }
      return newState;
    });
    setCurrMoney(valAsNumber);

  }

  function onBlur(e){
    var value = e.target.value;
    // if (positiveTransactions.includes(props.transactionType) && e.target.value < 0) {
    //   let options  = {
    //    buttons: ["Ok"],
    //    message: 'Amount must be positive!'
    //   }
    //   const confirmed = dialog.showMessageBoxSync(options)
    //   // alert('Amount must be positive!')
    //   e.target.value = 0;
    //   value = 0;
    // }
    // if (negativeTransactions.includes(props.transactionType) && e.target.value > 0) {
    //   let options  = {
    //    buttons: ["Ok"],
    //    message: 'Amount must be negative!'
    //   }
    //   const confirmed = dialog.showMessageBoxSync(options)
    //   // alert('Amount must be negative!')
    //   e.target.value = 0;
    //   value = 0;
    // }

    e.target.value = value
      ? localStringToNumber(value).toLocaleString(undefined, options)
      : '';

    const name = props.name
    props.setState(state => {
      const newState = {...state}
      newState[name] =  localStringToNumber(value)
      if (newState['Net Amount'] !== undefined && props.name !== 'Withhold $') {
        if (currMoney === undefined) {
          newState['Net Amount'] = newState['Net Amount'] + localStringToNumber(value)
        }
        else {
          newState['Net Amount'] = newState['Net Amount'] + localStringToNumber(value) - currMoney
        }

      }
      return newState;
    });
    setCurrMoney(localStringToNumber(value));
  }

  const size = props.size * 10 + "px";

  placeholder = "Enter ".concat(placeholder.toLowerCase());

  return (
    <div className="input-group" style={{width: "90%", paddingBottom: '10px', paddingLeft: '5px'}}>
        <span style={{width: size}} className="input-group-addon"
              id={props.name}>{props.name}</span>
        <input type={'currency'} onFocus={onFocus.bind(this)}
                onBlur={onBlur.bind(this)} onChange={onChange.bind(this)}
                className="form-control" placeholder={placeholder}
                defaultValue={defaultValue} required/>
    </div>
  );
};

const RowInvestment = (props) => {
  const [defaultOptions, setDefaultOptions] = useState(investmentOptions);
  let defaultInvestment = props.state[props.name];
  if (defaultInvestment === undefined) {
    if (props.transactionType === 'CONTRIBUTION' ||
        props.transactionType === 'DISTRIBUTION') {

        defaultInvestment = props.state.initial;
    }
    else {
      defaultInvestment = props.investmentID;
    }
  }


  const [value, setValue] = useState(null);
  let defaultInvestmentIdToValue = null;

  let loadOptions = loadAllOptions;
  if (props.transactionType === 'CONTRIBUTION' ||
      props.transactionType === 'DISTRIBUTION') {
    if (props.name === 'From Investment') {
      loadOptions = loadCommitOptions;
    }
    else if (props.name === 'Investment') {
      loadOptions = loadNonCommitOptions;
    }
  }

  const onChange = (inputText) => {
    props.setState(state => {
      const newState = {...state}
      newState[props.name] = inputText
      return newState;
    });

    setValue(inputText)
  }

  const size = props.size * 10 + "px";

  useEffect(() => {
    async function fetchData() {
      let thisInvestmentLinkedInvestmentId = undefined;
      InvestmentData = await getInvestments();
      investmentOptions = InvestmentData.map((data) => {
        const label = data.long_name;
        if (data.id === props.investmentID && data.linked_investment !== undefined) {
          // if there is a linked investment set it equal to this one
          thisInvestmentLinkedInvestmentId = data.linked_investment;
        }
        if (data.id === defaultInvestment) {
          defaultInvestmentIdToValue = {label: label, value: data};
          setValue({label: label, value: data})
          props.setState(state => {
            const newState = {...state}
            newState[props.name] = {label: label, value: data}
            return newState;
          });
          // props.setState((state) => (props.name: {label: label, value: data} ))
        }
        return {label: label, value: data};
      })

      let linkedInvestment = null;
      if (thisInvestmentLinkedInvestmentId !== undefined) {
        InvestmentData.map((data) => {
          const label = data.long_name
          if (data.id === thisInvestmentLinkedInvestmentId) {
            linkedInvestment ={label: label, value: data}
          }
        })
      }
      console.log(linkedInvestment)
      if (loadOptions === loadCommitOptions) {
        console.log('commit options')
        setDefaultOptions(investmentOptions.filter(i => i.value.has_commitment));
        if (thisInvestmentLinkedInvestmentId !== undefined) {
          props.setState(state => {
            const newState = {...state}
            newState[props.name] = linkedInvestment
            return newState;
          });
          setValue(linkedInvestment)
          return
        }
      }
      if (loadOptions === loadNonCommitOptions) {
        console.log('non commit options')
        const nonCommit = investmentOptions.filter(i => !i.value.has_commitment)
        setDefaultOptions(nonCommit);
        if (defaultInvestment.value === undefined) {
          if (thisInvestmentLinkedInvestmentId !== undefined) {
            props.setState(state => {
              const newState = {...state}
              newState[props.name] = linkedInvestment
              return newState;
            });
            setValue(linkedInvestment)
            return
          }

          if (!isNaN(defaultInvestment)) {
            setValue(defaultInvestmentIdToValue);
            return;
          }
          let displayInvestment = nonCommit[0]
          props.setState(state => {
            const newState = {...state}
            newState[props.name] = displayInvestment
            return newState;
          });
          setValue(displayInvestment)
        }
        else {
          setValue(defaultInvestment)
        }


      }
      if (loadOptions === loadAllOptions) {
        setDefaultOptions(investmentOptions);
        if (!isNaN(defaultInvestment)) {
          setValue(defaultInvestmentIdToValue);
          return;
        }
        setValue(defaultInvestment)
      }

    }
    fetchData();
  }, [])

  let displayName = props.name;
  if (props.transactionType === 'CONTRIBUTION' || props.transactionType === 'DISTRIBUTION') {
    if (props.name === 'Investment') {
      displayName = 'Contra Investment'
    }
  }

  return (
    <div className="input-group" style={{width: "90%", paddingBottom: '10px', paddingLeft: '5px'}}>
        <span style={{width: size}} className="input-group-addon" id={props.name}>{displayName}</span>
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
  if (props.name.includes("Date")) {
    type = "date";
  }
  else if (props.name.includes("Amount")) {
    type = "number";
  }
  else {
    type="text";
  }


  const onChange = (e) => {
    const newState = {
      ...props.state,
      changer: props.name
    }
    newState[props.name] = e.target.value
    props.setState(newState)
  }

  const onBlur = (e) => {
    if (type === 'date') {
      const now = new Date();
      const then = new Date(e.target.value)
      if (then === 'Invalid Date') {
        let options  = {
         buttons: ["Yes","No"],
         message: `The date you entered is technically not correct (Possibly Feb 31st). Are you sure?`
        }
        const confirmed = dialog.showMessageBoxSync(options)
        // const confirmed = window.confirm(`The date you entered is technically not correct (Possibly Feb 31st). Are you sure?`)
        if (confirmed === 1) {
          e.target.value = null;
          e.target.focus();
        }
        else {
          // console.log('confirmed!');
          // e.target.blur();
          return;
        }
      }


      const difference = now.getTime() - then.getTime();
      const year_difference = difference / (1000 * 3600 * 24 * 365);
      // console.log(year_difference)
      const max_years = 20;
      if (Math.abs(year_difference) >= max_years ) {
        let options  = {
         buttons: ["Yes","No"],
         message: `The date you entered is more than ${max_years} years away. Are you sure?`
        }
        const confirmed = dialog.showMessageBoxSync(options)
        // const confirmed = window.confirm(`The date you entered is more than ${max_years} years away. Are you sure?`)
        if (confirmed === 1) {
          e.target.value = null;
          e.target.focus();
        }
        else {
          // console.log('confirmed!');
          e.target.blur();
          e.preventDefault();
        }

      }
    }
  }

  const size = props.size * 10 + "px";

  placeholder = "Enter ".concat(placeholder.toLowerCase());

  if (props.name === 'Notes') {
    return (
      <div className="input-group" style={{width: "90%", paddingBottom: '10px', paddingLeft: '5px'}}>
          <span style={{width: size}} className="input-group-addon" id={props.name}>{props.name}</span>
          <input type={type} onChange={onChange.bind(this)} onBlur={onBlur.bind(this)}
              value={props.state[props.name]}
              className="form-control" placeholder={placeholder} />
      </div>
    );
  }
  return (
    <div className="input-group" style={{width: "90%", paddingBottom: '10px', paddingLeft: '5px'}}>
        <span style={{width: size}} className="input-group-addon" id={props.name}>{props.name}</span>
        <input type={type} onChange={onChange.bind(this)} onBlur={onBlur.bind(this)}
            value={props.state[props.name]}
            className="form-control" placeholder={placeholder} required />
    </div>
  );
};


const FormSheet = (props) => {
  console.log(props)
  // for all data
  const [InvestmentData, setInvestmentData] = useState(null);
  const [InvestmentName, setInvestmentName] = useState(null);
  const getInvestmentData = props.getInvestmentData;

  const isSelected = props.transactionType !== undefined ||
        props.dropdownOptions.length === 1;
  const [hasSelected, setSelected] = useState(isSelected);

  let defaultTransactionType = props.transactionType;
  if (defaultTransactionType === undefined) {
    if (props.dropdownOptions.length === 1) {
      defaultTransactionType = props.dropdownOptions[0];
    }
  }
  const [transactionType, setTransactionType] = useState(defaultTransactionType);
  const [rows, setRows] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState(props.dropdownOptions)

  const investmentID = props.investmentID;

  // console.log(props)
  console.log(props.initial)
  console.log(transactionType)

  const [state, setState] = useState(props.initial ? props.initial :
    {'Net Amount': 0, 'From Investment ID': investmentID,
     'Investment': props.linkedInvestment});

  if (props.initial['Date Sent'] !== undefined) {
    state['Contra Date'] = props.initial['Date Sent'];
  }
  console.log(state)

  const [error, setError] = useState(null);
  if (props.initial !== undefined && Object.keys(state).length === 0
      && Object.keys(props.initial).length !== 0) {
    setState(props.initial)
  }


  useEffect(()=> {
    if (state.changer === 'Date Due') {
      state['Contra Date'] = state['Date Due']
    }

    // if (transactionType !== 'CONTRIBUTION' ||
    //     transactionType !== 'DISTRIBUTION' ||
    //     transactionType !== 'TRANSFER') {
    //
    //   state['Investment'] = investmentID;
    // }

    async function fetchData() {
      const result = await getInvestmentData();
      if (!result) {
        throw 'Server Disconnected: Investment data null'
      }
      setInvestmentData(result);
      result.map(data => {
        if (data.id === investmentID) {
          setInvestmentName(data.name)
        }
      })
    }
    fetchData().catch(e =>
      setError(e)
    )

    let mainColumns = null;
    switch (transactionType) {
      case 'CONTRIBUTION':
        mainColumns = ['Date Due', 'Contra Date', 'Net Amount',
        'Main $', 'Fees $', 'Tax $',
        'Outside Main $', 'Outside Fees $', 'Outside Tax $',
        'Notes', 'Investment'];
        break;
      case 'DISTRIBUTION':
        mainColumns = ['Date Due', 'Contra Date', 'Net Amount', 'Main $', 'Withhold $',	'Recallable $', 'Notes', 'Investment'];
        break;
      case 'TRANSFER':
        mainColumns = ['Date', 'From Investment', 'To Investment', 'Amount', 'Notes'];
        break;
      case 'COMMISH':
        mainColumns = ['Date', 'Amount', 'From Investment', 'Notes', 'Investment']
        break;
      default: // single entry transaction details
        mainColumns = ['Date', 'Amount', 'Notes', 'Investment'];
    }

    const mainLengths = mainColumns.map(a => a.length );
    const maxSize = mainLengths.reduce((a, b) =>  Math.max(a, b));


    const newRows = mainColumns.map((column) => {
       if (column === 'Amount' || column.includes('$')) {
         return <RowCurrency
                                key={column + transactionType} name={column} size={maxSize}
                                state={state} setState={setState}
                                transactionType={transactionType}/>;
       }
       else if (column === 'Net Amount') {
         return <RowCurrencyNet key={column + transactionType}
                                name={column} size={maxSize}
                                state={state} setState={setState}/>;
       }
       else if (column === 'Investment') {
         return ( <Fragment>
           <br />
           <br />
           <br />
            <RowInvestment name={column} key={column + transactionType} size={maxSize}
                                  state={state} setState={setState}
                                  investmentID={investmentID}
                                  transactionType={transactionType}/>
                  </Fragment>
                                )
       }
       else if (column.includes('Investment')) {
         return <RowInvestment name={column} key={column + transactionType} size={maxSize}
                                  state={state} setState={setState}
                                  investmentID={investmentID}
                                  transactionType={transactionType}/>
       }
       else {
         return <RowBland key={column + transactionType} name={column} size={maxSize}
                          state={state} setState={setState}/>;
       }
    });
    setRows(newRows);

  }, [transactionType, state]);

  const onClick = (e) => {
    if (transactionType === 'DISTRIBUTION') {
      if (state['Net Amount'] > 0) {
        let options  = {
         buttons: ["Yes","No"],
         message: 'DISTRIBUTION Net Amount is Positive. Are you sure?'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        // const confirmed = window.confirm('DISTRIBUTION Net Amount is Positive. Are you sure?')
        if (confirmed === 1) {
          e.preventDefault();
          // return false;
        }
      }
    }
    if (transactionType === 'CONTRIBUTION') {
      if (state['Net Amount'] < 0) {
        let options  = {
         buttons: ["Yes","No"],
         message: 'CONTRIBUTION Net Amount is Negative. Are you sure?'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        // const confirmed = window.confirm('CONTRIBUTION Net Amount is Negative. Are you sure?')
        if (confirmed === 1) {
          e.preventDefault();
          // return false;
        }
      }
    }
    if (transactionType === 'TRANSFER') {
      if (state['From Investment'].value.id === state['To Investment'].value.id) {
        let options  = {
         buttons: ["Ok"],
         message: `You cannot have the investments be the same`
        }
        const confirmed = dialog.showMessageBoxSync(options)
        e.preventDefault();
      }

      if (state['Net Amount'] < 0) {
        let options  = {
         buttons: ["Ok"],
         message: 'Transfer amount must be positive!'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        e.preventDefault()
      }
    }

    if(positiveTransactions.includes(transactionType)) {
      if (state['Net Amount'] < 0) {
        let options  = {
         buttons: ["Ok"],
         message: 'Amount must be positive!'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        e.preventDefault()
      }
    }
    if(negativeTransactions.includes(transactionType)) {
      if (state['Net Amount'] > 0) {
        let options  = {
         buttons: ["Ok"],
         message: 'Amount must be negative!'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        e.preventDefault()
      }
    }

    Object.keys(state).map(column => {
      if (column.includes('Amount') || column.includes('$')) {
        state[column] = parseFloat(state[column]);
        // const a = parseFloat(state[column]);
        // console.log(state)
        // alert('hello: ' + a)
        // const confirmed = window.confirm('CONTRIBUTION Net Amount is Negative. Are you sure?')
        // if (!confirmed) {
        //   e.preventDefault();
        //   // return false;
        // }
      }
    });
    // state['Type'] = transactionType;
    // const updatedEvent = updateEvent({
    //   state: state
    // });
    // console.log(state)
    // console.log(updatedEvent)
    // console.log(updatedEvent)
    // return false;
    // onSubmit(e);
  }

  const onSubmit = (e) => {
    state['Type'] = transactionType;

    if (state.Id !== undefined) {
      const updatedEvent = updateEvent({
        state: state
      });

      updatedEvent['type'] = transactionType;
      ipcRenderer.sendTo(senderWindowId, replyChannel, {})
      return;

    }
    const newEvent = createEvent({
      state: state
    });
    console.log(newEvent)


    newEvent['type'] = transactionType;
    ipcRenderer.sendTo(senderWindowId, replyChannel, {})
  };

  const exit = (e) => {
    var window = remote.getCurrentWindow();
    window.close();
  }

  let contributionWarning = null;
  if (transactionType === 'DISTRIBUTION') {
    contributionWarning = <h3> Distribution net amount must be negative  </h3>
  }

  let displayInvestmentName;
  if(InvestmentName) {
    displayInvestmentName = <h2> Investment = {InvestmentName} </h2>
  }


  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  return (
     <div>
       <MyDropdown dropdownOptions={dropdownOptions}
                   setSelected={setSelected}
                   transactionType={transactionType}
                   setTransactionType={setTransactionType}/>
       <br />
       <form style={{visibility: hasSelected ? 'visible' : 'hidden'}}
              onSubmit={onSubmit}>
         {displayInvestmentName}
         {contributionWarning}
         {rows}
         <input id="submitForm" type="submit" onClick={onClick} />
         <input id="cancel" type="button" value="Cancel" onClick={exit}
                  style={{float: "right", marginRight: "10%"}}/>
       </form>
     </div>
  );
}

const MyDropdown = (props) => {
  const setSelected = props.setSelected;
  const defaultTitleText = props.transactionType ? props.transactionType : 'Choose...' ;
  const setTransactionType = props.setTransactionType;

  const [titleText, setTitleText] = useState(defaultTitleText);
  const myTitle = <div> {titleText} <span style={{borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent", borderTop: "8px solid #FFFFFF"}} className="caret"></span> </div>;

  const selectOption = (e) => {
    setSelected(true);
    setTitleText(e.target.innerText);
    setTransactionType(e.target.innerText);
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
