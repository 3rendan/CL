import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { HashRouter as Router, Route, Switch } from 'react-router-dom'

import Home from "./App"
import Investment from './investments'
import EventsTable from "./events"

import {AccountTable, InvestmentTable} from './maintenance/AccountInvestment'
import MaintenanceTable from './maintenance/AssetsBenchmarksOwners'
import Calendar from './calendar/calendar'
import FormSheet from './popup'

// Data
import {AccountData, InvestmentData, OwnerData,
        AssetClassData, BenchmarkData, Events, NAVEvents,
        Transfers} from './Data'

const NoMatch = () => {
  return <h1> No Match </h1>
}


// render
ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/" component={Home} />
      <Route path="/investments">
        <Investment data={InvestmentData} name={'Investments'} />
      </Route>
      <Route path="/calendar" component={Calendar} />
      // EVENTS AND TRANSFERS
      <Route path="/transfers">
        <EventsTable data={Transfers} name={'Transfers'} />
      </Route>
      <Route path="/events">
        <EventsTable data={Events}    name={'Events'} />
        <EventsTable data={NAVEvents} name={'NAVEvents'} />
      </Route>
      // MAINTENANCE
      <Route path="/maintenance/accountInvestment">
        <InvestmentTable data={InvestmentData} name={'Investment Data'} />
        <AccountTable    data={AccountData}    name={'Account Data'} />
      </Route>
      <Route path="/maintenance/AssetsBenchmarksOwners">
        <MaintenanceTable name={"Asset Class"} data={AssetClassData}/>
        <MaintenanceTable name={"Owner"}       data={OwnerData}/>
        <MaintenanceTable name={"Benchmark"}   data={BenchmarkData}/>
      </Route>
      // POPUPs
      <Route path="/popup/event">
        <FormSheet dropdownOptions={['INFLOW', 'OUTFLOW', 'DIV', 'GAIN', 'CONTRIBUTION', 'DISTRIBUTION']} />,
      </Route>
      <Route path="/popup/NAVevent">
        <FormSheet transcationType={'NAV'} dropdownOptions={['NAV']} />,
      </Route>
      <Route path="/popup/transfer">
        <FormSheet transcationType={'TRANSFER'} dropdownOptions={['TRANSFER']} />,
      </Route>
      <Route path="/" component={NoMatch} />
    </Switch>
  </Router>,
  document.getElementById("root")
)
