import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from "react-dom";

import {RowCurrencyNet, RowCurrency, RowInvestment,
  RowBland, MyDropdown} from './popupElements'
import {createEvent, updateEvent} from '../serverAPI/eventsAndTransfers'

import {getInvestments} from '../serverAPI/investments.js'
const electron = window.require('electron');
const dialog = electron.remote.dialog
const remote = electron.remote;

const positiveTransactions = ['INFLOW', 'CREDIT', 'INT', 'DIV', 'GAIN']
const negativeTransactions = ['OUTFLOW', 'EXPENSE', 'FEE']

const browserWindow  = electron.remote.BrowserWindow;


const NewPopup = (props) => {
  // initial data
  const onlyOneOption = props.dropdownOptions.length === 1;
  let initialTransactionType = null;
  if (onlyOneOption) {
    initialTransactionType = props.dropdownOptions[0];
  }
  // for all data
  const [InvestmentData, setInvestmentData] = useState(null);
  const [InvestmentName, setInvestmentName] = useState(null);

  const [hasSelected, setSelected] = useState(onlyOneOption);
  const [transactionType, setTransactionType] = useState(initialTransactionType);
  const [rows, setRows] = useState(null);
  const [dropdownOptions, setDropdownOptions] = useState(props.dropdownOptions)

  const investmentID = props.investmentID;
  const contraInvestment = props.linkedInvestment;

  const [state, setState] = useState({'Net Amount': 0, 'From Investment ID': investmentID, 'Fund Investment': investmentID});
  const [error, setError] = useState(null);


  useEffect(()=> {
    if (state.changer === 'Date Due') {
      state['Contra Date'] = state['Date Due']
    }

    if (transactionType !== 'CONTRIBUTION' &&
        transactionType !== 'DISTRIBUTION' &&
        transactionType !== 'TRANSFER') {

      state['Investment'] = investmentID;
      // state['Contra Investment'] = investmentID;
    }

    async function fetchData() {
      const result = await getInvestments();
      if (!result) {
        throw 'Server Disconnected: Investment data null'
      }
      setInvestmentData(result);
      result.map(data => {
        if (data.id === investmentID) {
          setInvestmentName(data.name);
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
        'Notes', 'Contra Investment'];
        break;
      case 'DISTRIBUTION':
        mainColumns = ['Date Due', 'Contra Date', 'Net Amount', 'Main $',
        'Withhold $',	'Recallable $', 'Notes', 'Contra Investment'];
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

    const mainLengths = mainColumns.map(a => a.length);
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
    if (state['Investment'] === null) {
      let options  = {
       buttons: ["Ok"],
       message: 'No investment was set!'
      }
      const confirmed = dialog.showMessageBoxSync(options)
      e.preventDefault();
    }

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
      if(state['From Investment'].value.id === state['To Investment'].value.id) {
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
      if (state['Net Amount'] < 0 || state['Amount'] < 0) {
        let options  = {
         buttons: ["Ok"],
         message: 'Amount must be positive!'
        }
        const confirmed = dialog.showMessageBoxSync(options)
        e.preventDefault()
      }
    }
    if(negativeTransactions.includes(transactionType)) {
      if (state['Net Amount'] > 0 || state['Amount'] > 0) {
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
      }
    });
  }

  const onSubmit = (e) => {
    state['Type'] = transactionType;
    const newEvent = createEvent({
      state: state
    });


    newEvent['type'] = transactionType;
    browserWindow.getAllWindows().map(window => window.reload())
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
  if (InvestmentName) {
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



export default NewPopup;
