import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { addDays } from 'date-fns';

import './calendar.css'

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

const daysOfWeek = ['Sun','Mon','Tues','Wednes','Thurs','Fri','Sat'];

const CalendarData = [{date: addDays(new Date(), -14), title: '1'}, {date: addDays(new Date(), -9), title: '1'},
{date: addDays(new Date(), -9), title: '1'}, {date: addDays(new Date(), -3), title: '1'}, {date: addDays(new Date(), 0), title: '1'}, {date: addDays(new Date(), 1), title: '1'},
{date: new Date('2020,07,02'), title: '1'},];

const Calendar = () => {
  var [state, setState] = useState({
    startDate: businessDaysFromDate(new Date(), -5),
    endDate: businessDaysFromDate(new Date(), 15),
  });

  return (<div> <CalendarButton state={state}  setState={setState}/>
                <br />
               <CalenderListView key={state} state={state}/> </div>);
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
      alert(e.target.id + " is not in valid date format");
      e.target.focus();
    }

  }


  return (
    <div>
      <div className="text">
      Start Date:
      </div>
      <input type="text" id="startDate"
      defaultValue={startDateString} onBlur={handleChange.bind(this)}/>
      <div className="text">
      End Date:
      </div>
      <input type="text" id="endDate"
      defaultValue={endDateString} onBlur={handleChange.bind(this)}/>
    </div>
  );
};

// midnight the day before so that today is after the dividing line
const midnight = addDays(new Date(),-1);
midnight.setHours(24, 0, 0, 0);


const CalendarListElement = (props) => {
  const getDateString = (date) => {
    var month = date.toLocaleString('default', { month: 'long' }); //months from 1-12
    var day = date.getUTCDate();
    var year = date.getUTCFullYear();

    return daysOfWeek[date.getDay()] + ", " + month + " " + day + ", " + year;
  };

  const isSameDay = (date1, date2) => {
    return (date1.getUTCDate() == date2.getUTCDate() &&
        date1.getUTCFullYear() == date2.getUTCFullYear() &&
        date1.getUTCMonth() == date2.getUTCMonth());
  }

  const date = props.date;
  var num_events = 0;
  var calendarEvents = CalendarData.map((currDate2) => {
      const currDate = currDate2.date;
      const title = currDate2.title;
      if (isSameDay(currDate, date)) {
        num_events += 1;
        return (
        <div key={currDate + " " + title + " " + num_events} className="CalendarEvent">
          {title}
        </div>);
      }
    }
  );
  calendarEvents = calendarEvents.filter(event => event != undefined);
  if (calendarEvents.length <= 0) {
    return null;
  }

  const calendarEventsString = "Contribution due to account 0";

  if (date < midnight) {
    return (
      <div className="row">
        <div className="columnDate">
          {getDateString(date)}
        </div>
        <div className="column">
          {calendarEventsString}
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
          {calendarEventsString}
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
        {calendarEventsString}
      </div>
    </div>
  );
}

const CalenderListView = (props) => {
  var state = props.state;

  const startDate = state.startDate;
  const endDate = state.endDate;

  var listCalendarDatesBefore = [];

  for (var d = addDays(startDate, 1); d < midnight; d.setDate(d.getDate() + 1)) {
    if (d > endDate) {
      break;
    }
    listCalendarDatesBefore.push(<CalendarListElement key={d} date={new Date(d)} />);
  }

  var listCalendarDatesAfter= [];
  for (var d = new Date(midnight); d <= endDate; d.setDate(d.getDate() + 1)) {
    if (d < startDate) {
      break;
    }
    listCalendarDatesAfter.push(<CalendarListElement key={d} date={new Date(d)} />);
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
