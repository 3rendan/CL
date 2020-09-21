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
      if (newState['Net Amount'] !== undefined) {
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
  const defaultInvestment = props.state[props.name] ? props.state[props.name] : props.investmentID;

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

const RowEditInvestment = (props) => {
  const [defaultOptions, setDefaultOptions] = useState(investmentOptions);
  const defaultInvestment = props.state[props.name];

  const [value, setValue] = useState(null);
  let defaultInvestmentIdToValue = null;

  let loadOptions = loadAllOptions;

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

      setDefaultOptions(investmentOptions);
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
    const copyE = {...e};
    newState[props.name] = copyE.target.value;
    console.log(copyE.target.value)
    if (props.name === 'Contra Date') {
      console.log('HERE!!!')
      console.log(newState)
      newState['Contra Date'] = copyE.target.value;
      console.log(newState)
      newState['Date Sent'] = copyE.target.value;
      console.log(newState)
    }
    console.log(newState)
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

export {
  RowCurrencyNet,
  RowCurrency,
  RowInvestment,
  RowEditInvestment,
  RowBland,
  MyDropdown
}
