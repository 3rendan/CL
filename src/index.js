import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { HashRouter as Router, Route, Switch } from 'react-router-dom'

import EventsTable from "./events"

import {ViewInvestmentTable} from './maintenance/AccountInvestment'
import Calendar from './calendar/calendar'
import FormSheet from './popup'

import {getInvestments} from './serverAPI/investments.js'

import AssetClassTable from './tables/AssetClassTable';
import AccountTable from './tables/AccountTable';
import BenchmarkTable from './tables/BenchmarkTable';
import InvestmentTable from './tables/InvestmentTable';
import ViewOnlyInvestmentTable from './tables/ViewOnlyInvestmentTable';
import OwnerTable from './tables/OwnerTable';

// Data
import {Events, NAVEvents, Transfers} from './Data'

const NoMatch = () => {
  return <h1> No Match </h1>
}


// render
ReactDOM.render(
  <Router>
    <Switch>
      <Route path="/investments">
        <ViewOnlyInvestmentTable />
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
        <InvestmentTable />
        <AccountTable />
      </Route>
      <Route path="/maintenance/AssetsBenchmarksOwners">
        <AssetClassTable />
        <OwnerTable />
        <BenchmarkTable />
      </Route>
      // POPUPs
      <Route path="/popup/event">
        <FormSheet getInvestmentData={getInvestments} dropdownOptions={['INFLOW', 'OUTFLOW', 'DIV', 'GAIN', 'CONTRIBUTION', 'DISTRIBUTION']} />,
      </Route>
      <Route path="/popup/NAVevent">
        <FormSheet getInvestmentData={getInvestments} transcationType={'NAV'} dropdownOptions={['NAV']} />,
      </Route>
      <Route path="/popup/transfer">
        <FormSheet getInvestmentData={getInvestments} transcationType={'TRANSFER'} dropdownOptions={['TRANSFER']} />,
      </Route>
      <Route path="/" component={NoMatch} />
    </Switch>
  </Router>,
  document.getElementById("root")
)
