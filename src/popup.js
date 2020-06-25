import React, {useState, useEffect} from "react";
import ReactDOM from "react-dom";


import DropdownButton from 'react-bootstrap/DropdownButton';
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';


const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;
const browserWindow  = electron.remote.BrowserWindow;

var senderWindow = null;

ipcRenderer.on('popupMessage', (event, message) => {
  senderWindow = browserWindow.fromId(message.id);
})

const RowCurrencyNet = (props) => {
  let currency = 'USD';

  const value = props.netAmount;
  const min = 0;

  function localStringToNumber( s ){
    return Number(String(s).replace(/[^0-9.-]+/g,""))
  }


  var investmentData = null;
  // if (props.name == "Investment") {
  //   investmentData = JSON.stringify(myRowData);
  // }

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
      console.log('HELLO');
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
  const [hasSelected, setSelected] = useState(false);
  const [transcationType, setTranscationType] = useState(null);
  const [rows, setRows] = useState(null);

  const [state, setState] = useState({});

  const [netAmount, setNetAmount] = useState(0.0);

  useEffect(()=> {
    let mainColumns = null;
    let passFunc = null;
    switch (transcationType) {
      case 'Contribution':
        mainColumns = ['Date Due', 'Date Sent', 'Net Amount', 'Fees $',	'Tax $',	'Outside $', 'Other $', 'From Investment', 'Notes'];
        passFunc = setNetAmount;
        break;
      case 'Distribution':
        mainColumns = ['Date Due', 'Date Sent', 'Net Amount', 'Withhold $',	'Recallable $',	'Other $', 'From Investment', 'Notes'];
        passFunc = setNetAmount;
        break;
      case 'Transfer':
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
       if (column == 'Amount' || column.includes('$')) {
         const a = <RowCurrency netAmount={netAmount} setNetAmount={passFunc}
                                key={column} name={column} size={maxSize}
                                state={state} setState={setState}/>;
         return a;
       }
       else if (column == 'Net Amount') {
         return <RowCurrencyNet netAmount={netAmount} key={column}
                                name={column} size={maxSize}
                                state={state} setState={setState}/>;
       }
       else {
         return <RowBland key={column} name={column} size={maxSize}
                          state={state} setState={setState}/>;
       }
    });
    setRows(newRows);

  }, [transcationType, netAmount, state]);


  const onSubmit = () => {
    state['Type'] = transcationType;
    senderWindow.webContents.send('replyEvent', state)
  };


  return (
     <div>
       <MyDropdown dropdownOptions={props.dropdownOptions}
                   setSelected={setSelected}
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
  const setTranscationType = props.setTranscationType;

  const [titleText, setTitleText] = useState('Choose...');
  const myTitle = <div> {titleText} <span style={{borderLeft: "8px solid transparent",
    borderRight: "8px solid transparent", borderTop: "8px solid #FFFFFF"}} className="caret"></span> </div>;
  // const myTitle = "Hello";

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
