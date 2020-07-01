import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';

import Spinner from 'react-bootstrap/Spinner'
import './index.css';
import { HashRouter as Router, Route, Switch } from 'react-router-dom'

import {getInvestments} from './serverAPI/investments.js'

// Data
import {Events, NAVEvents, Transfers} from './Data'

const NoMatch = () => {
  return <h1> No Match </h1>
}

const AssetClassTable = lazy(() => import('./tables/AssetClassTable'));
const AccountTable = lazy(() => import('./tables/AccountTable'));
const BenchmarkTable = lazy(() => import('./tables/BenchmarkTable'));
const InvestmentTable = lazy(() => import('./tables/InvestmentTable'));
const ViewOnlyInvestmentTable = lazy(() => import('./tables/ViewOnlyInvestmentTable'));
const OwnerTable = lazy(() => import('./tables/OwnerTable'));
const EventsTable = lazy(() => import("./events"));
const Calendar = lazy(() => import('./calendar/calendar'));
const FormSheet = lazy(() => import('./popup'));


// render
ReactDOM.render(
  <Router>
    <Suspense fallback={<Spinner />}>
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
    </Suspense>
  </Router>,
  document.getElementById("root")
)
