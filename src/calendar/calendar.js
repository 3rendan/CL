import React, {Fragment, useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { addDays } from 'date-fns';

import moment from 'moment';

import './calendar.css'
import {getDistributionEventsTime as getDistributions, getAllDistributionEvents as getAllDistributions} from '../serverAPI/distributions'
import {getContributionEventsTime as getContributions, getAllContributionEvents as getAllContributions} from '../serverAPI/contributions'

import {getInvestment} from '../serverAPI/investments'
import {myMoneyFormatter} from '../SpecialColumn';

const electron = window.require('electron');
const dialog = electron.remote.dialog

function groupBy(array, item) {
  if (item.includes('date')) {
    const result = array.reduce(function (r, a) {
          const formatted_item = moment(a[item]).format('L')
          r[formatted_item] = r[formatted_item] || [];
          r[formatted_item].push(a);
          return r;
      }, Object.create(null));
    return result;
  }
  const result = array.reduce(function (r, a) {
        r[a[item]] = r[a[item]] || [];
        r[a[item]].push(a);
        return r;
    }, Object.create(null));
  return result;
}

// https://stackoverflow.com/questions/21297323/calculate-an-expected-delivery-date-accounting-for-holidays-in-business-days-u
function businessDaysFromDate(date,businessDays) {
  var counter = 0, tmp = new Date(date);
  if (businessDays < 0) {
    while (businessDays <= 0) {
      tmp.setTime( date.getTime() - counter * 86400000 );
      if(isBusinessDay (tmp)) {
        ++businessDays;
      }
      ++counter;
    }
    return tmp;
  }
  while( businessDays>=0 ) {
    tmp.setTime( date.getTime() + counter * 86400000 );
    if(isBusinessDay (tmp)) {
      --businessDays;
    }
    ++counter;
  }
  return tmp;
};

function isBusinessDay (date) {
  var dayOfWeek = date.getDay();
  if(dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend
    return false;
  }

  const holidays = [
    '12/31+5', // New Year's Day on a saturday celebrated on previous friday
    '1/1',     // New Year's Day
    '1/2+1',   // New Year's Day on a sunday celebrated on next monday
    '1-3/1',   // Birthday of Martin Luther King, third Monday in January
    '2-3/1',   // Washington's Birthday, third Monday in February
    '5~1/1',   // Memorial Day, last Monday in May
    '7/3+5',   // Independence Day
    '7/4',     // Independence Day
    '7/5+1',   // Independence Day
    '9-1/1',   // Labor Day, first Monday in September
    '10-2/1',  // Columbus Day, second Monday in October
    '11/10+5', // Veterans Day
    '11/11',   // Veterans Day
    '11/12+1', // Veterans Day
    '11-4/4',  // Thanksgiving Day, fourth Thursday in November
    '12/24+5', // Christmas Day
    '12/25',   // Christmas Day
    '12/26+1',  // Christmas Day
  ];

  var dayOfMonth = date.getDate();
  var month = date.getMonth() + 1;
  var monthDay = month + '/' + dayOfMonth;

  if(holidays.indexOf(monthDay)>-1){
    return false;
  }

  var monthDayDay = monthDay + '+' + dayOfWeek;
  if(holidays.indexOf(monthDayDay)>-1){
    return false;
  }

  var weekOfMonth = Math.floor((dayOfMonth - 1) / 7) + 1,
      monthWeekDay = month + '-' + weekOfMonth + '/' + dayOfWeek;
  if(holidays.indexOf(monthWeekDay)>-1){
    return false;
  }

  var lastDayOfMonth = new Date(date);
  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
  lastDayOfMonth.setDate(0);
  var negWeekOfMonth = Math.floor((lastDayOfMonth.getDate() - dayOfMonth - 1) / 7) + 1,
      monthNegWeekDay = month + '~' + negWeekOfMonth + '/' + dayOfWeek;
  if(holidays.indexOf(monthNegWeekDay)>-1){
    return false;
  }

  return true;
};

const daysOfWeek = ['Sun','Mon','Tues','Wed','Thurs','Fri','Sat'];

async function getInvestmentName(investmentID) {
  const investment = await getInvestment(investmentID);
  if (investment === null) {
    return "";
  }
  return investment.long_name;
}

const Calendar = () => {
  const [error, setError] = useState(null);
  const [state, setState] = useState({
    startDate: businessDaysFromDate(new Date(), -5),
    endDate: businessDaysFromDate(new Date(), 15),
  });
  const [distributions, setDistributions] = useState([]);
  const [contributions, setContributions] = useState([]);

  const getMemoizedInvestmentName = useCallback(async (id) => await getInvestmentName(id))

  async function fetchDefaultDistributions() {
    const defaultEvents = await getDistributions(state.startDate, state.endDate)
    const eventsById = {};
    defaultEvents.map(event => {
      eventsById[event.id] = event;
    })

    setDistributions(prevEvents => {
      return {
        ...prevEvents,
        ...eventsById
      }
    });
  }

  async function fetchAllDistributions() {
    const allEvents = await getAllDistributions();
    const eventsById = {};
    allEvents.map(event => {
      eventsById[event.id] = event;
    })

    setDistributions(prevEvents =>  {
      return {
        ...prevEvents,
        ...eventsById
      }
    });
  }

  async function fetchDefaultContributions() {
    const defaultEvents = await getContributions(state.startDate, state.endDate)
    const eventsById = {};
    defaultEvents.map(event => {
      eventsById[event.id] = event;
    })

    setContributions(prevEvents => {
      return {
        ...prevEvents,
        ...eventsById
      }
    });
  }

  async function fetchAllContributions() {
    const allEvents = await getAllContributions();
    const eventsById = {};
    allEvents.map(event => {
      eventsById[event.id] = event;
    })

    setContributions(prevEvents =>  {
      return {
        ...prevEvents,
        ...eventsById
      }
    });
  }

  useEffect(() => {
    fetchDefaultDistributions().catch(e =>
      setError(e)
    )
    fetchDefaultContributions().catch(e =>
      setError(e)
    )
    fetchAllDistributions().catch(e =>
      setError(e)
    )
    fetchAllContributions().catch(e =>
      setError(e)
    )
  }, [])

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  return (<div> <CalendarButton state={state}  setState={setState}/>
                <br />
               <CalenderListView key={state} state={state}
                                 contributions={contributions}
                                 distributions={distributions}
                                 getInvestmentNames={getMemoizedInvestmentName}/>
                  </div>);
};

const CalendarButton = (props) => {
  var state = props.state;
  var setState = props.setState;

  const startDate = state.startDate;
  const startDateString = (startDate.toLocaleDateString());

  const endDate = state.endDate;
  const endDateString = (endDate.toLocaleDateString());

  const handleChange = (e) => {
    const date = new Date(e.target.value);

    if (date instanceof Date && !isNaN(date)) {
      const newState = {...state};
      newState[e.target.id] = date;
      setState(newState);
    }
    else if (state.timeout === true) {
      e.target.focus()
    }
    else {
      state.timeout = true;
      setTimeout(function(){
          const newState = {...state};
          newState.timeout = false;
          setState(newState);
      }, 1000);
      let options  = {
       buttons: ["Ok"],
       message: e.target.id + " is not in valid date format"
      }
      const confirmed = dialog.showMessageBoxSync(options)
      // alert(e.target.id + " is not in valid date format");
      e.target.focus();
    }

  }


  return (
    <div>
      <div className="text">
      Start Date:
      </div>
      <input type="text" id="startDate" style={{width: '15%'}}
      defaultValue={startDateString} onBlur={handleChange.bind(this)}/>
      <div className="text">
      End Date:
      </div>
      <input type="text" id="endDate" style={{width: '15%'}}
      defaultValue={endDateString} onBlur={handleChange.bind(this)}/>
    </div>
  );
};

// midnight the day before so that today is after the dividing line
const midnight = addDays(new Date(),-1);
midnight.setHours(24, 0, 0, 0);

const CalendarListElement = (props) => {
  const getDateString = (date) => {
    var month = date.getMonth() + 1; //months from 1-12
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();

    return month + "/" + day + "/" + year + "(" + daysOfWeek[date.getDay()] + ")";
  };

  const isSameDay = (date1, date2) => {
    return (date1.getUTCDate() === date2.getUTCDate() &&
        date1.getUTCFullYear() === date2.getUTCFullYear() &&
        date1.getUTCMonth() === date2.getUTCMonth());
  }

  const getInvestmentNames = props.getInvestmentNames;
  const event = props.event;
  const date = props.date;
  const formatted_amount = myMoneyFormatter(event.net_amount);

  const [eventString, setEventString] = useState(null);

  useEffect(() => {
    async function getEventData() {
      const fundName = await getInvestmentNames(event.fund_investment);
      const contraName = await getInvestmentNames(event.contra_investment);

      let name = "";
      if (event.type === 'contribution') {
        name = `Contribution ${formatted_amount} due to ${fundName}`;
      }
      else {
        name = `Distribution ${formatted_amount} due from ${fundName}`;
      }
      setEventString(name)
    }

    getEventData();

  });

  if (date < midnight) {
    return (
      <div className="row">
        <div className="columnDate">
          {getDateString(date)}
        </div>
        <div className="column">
          {eventString}
        </div>
      </div>
    );
  }

  if (isSameDay(new Date(), date) ||
      isSameDay(addDays(new Date(), 1), date)) {
    return (
      <div className="row">
        <div style={{"backgroundColor": "LawnGreen", 'fontWeight': 'bold'}} className="columnDate">
          {getDateString(date)}
        </div>
        <div style={{"backgroundColor": "LawnGreen", 'fontWeight': 'bold'}} className="column">
          {eventString}
        </div>
      </div>
    );
  }
  return (
    <div className="row">
      <div style={{'fontWeight': 'bold'}} className="columnDate">
        {getDateString(date)}
      </div>
      <div style={{'fontWeight': 'bold'}} className="column">
        {eventString}
      </div>
    </div>
  );
}

const CalenderListView = (props) => {
  const distributionArray = Object.keys(props.distributions).map(function(key){
    const a = props.distributions[key]
    a.type = 'distribution';
    return a;
  });
  const contributionArray = Object.keys(props.contributions).map(function(key){
    const a = props.contributions[key];
    a.type = 'contribution';
    return a;
  });

  let contrAndDistribArray = distributionArray.concat(contributionArray);

  console.log(contrAndDistribArray)
  contrAndDistribArray = contrAndDistribArray.sort(function (a,b) {
      console.log(new Date(a['date_due']))
      console.log(new Date(b['date_due']))
      console.log(new Date(a['date_due']) - new Date(b['date_due']))
      return new Date(a['date_due']) - new Date(b['date_due']);
  });
  console.log(contrAndDistribArray)

  const startDate = props.state.startDate;
  const endDate = props.state.endDate;
  console.log(contrAndDistribArray)
  contrAndDistribArray = contrAndDistribArray.filter(function (event) {
    const date_due = new Date(event.date_due);
    if (date_due >= startDate && date_due <= endDate) {
      return true;
    }
    return false;
  });
  console.log(contrAndDistribArray)

  var listCalendarDatesBefore = [];
  var listCalendarDatesAfter= [];
  for (var event of contrAndDistribArray) {
    console.log(event)
    const date_due = new Date(event.date_due);
    const element = <CalendarListElement date={date_due}
                                  event={event}
                                  getInvestmentNames={props.getInvestmentNames}/>;
    if (date_due < midnight) {
      console.log('before ' + event);
      listCalendarDatesBefore.push(element);
    }
    else {
      console.log('after ' + event);
      listCalendarDatesAfter.push(element);
    }
  }


  return (
    <div>
      {listCalendarDatesBefore }
      <hr style={{'border': '1.5px solid black'}} />
      {listCalendarDatesAfter }
    </div>
  );
};

export default Calendar;
