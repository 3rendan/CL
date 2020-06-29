import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { HashRouter as Router, Route, Switch } from 'react-router-dom'

import EventsTable from "./events"

import {InvestmentTable, ViewInvestmentTable} from './maintenance/AccountInvestment'
import MaintenanceTable from './maintenance/AssetsBenchmarksOwners'
import Calendar from './calendar/calendar'
import FormSheet from './popup'


import {getOwners, OwnerColumns} from './serverAPI/owners.js'
import {getBenchmarks, BenchmarkColumns} from './serverAPI/benchmarks.js'
import {getAssetClasses, AssetClassColumns} from './serverAPI/assetClass.js'
import {getAccounts, AccountColumns} from './serverAPI/accounts.js'
import {getInvestments, InvestmentColumns} from './serverAPI/investments.js'

// Data
import {Events, NAVEvents,
        Transfers} from './Data'

const NoMatch = () => {
  return <h1> No Match </h1>
}


function render(OwnerData, BenchmarkData, AssetClassData, AccountData, InvestmentData) {
  // render
  ReactDOM.render(
    <Router>
      <Switch>
        <Route path="/investments">
          <ViewInvestmentTable data={InvestmentData}
            name={'Investment Data'}
           columns={InvestmentColumns} />
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
          <InvestmentTable     data={InvestmentData}
              AssetClassData={AssetClassData}  OwnerData={OwnerData}
              BenchmarkData={BenchmarkData} AccountData={AccountData}
            name={'Investment Data'} columns={InvestmentColumns} />
          <MaintenanceTable name={'Account'}     data={AccountData}    columns={AccountColumns} />
        </Route>
        <Route path="/maintenance/AssetsBenchmarksOwners">
          <MaintenanceTable name={"Asset Class"} data={AssetClassData}  columns={AssetClassColumns}/>
          <MaintenanceTable name={"Owner"}       data={OwnerData}       columns={OwnerColumns}/>
          <MaintenanceTable name={"Benchmark"}   data={BenchmarkData}   columns={BenchmarkColumns}/>
        </Route>
        // POPUPs
        <Route path="/popup/event">
          <FormSheet InvestmentData={InvestmentData} dropdownOptions={['INFLOW', 'OUTFLOW', 'DIV', 'GAIN', 'CONTRIBUTION', 'DISTRIBUTION']} />,
        </Route>
        <Route path="/popup/NAVevent">
          <FormSheet InvestmentData={InvestmentData} transcationType={'NAV'} dropdownOptions={['NAV']} />,
        </Route>
        <Route path="/popup/transfer">
          <FormSheet InvestmentData={InvestmentData} transcationType={'TRANSFER'} dropdownOptions={['TRANSFER']} />,
        </Route>
        <Route path="/" component={NoMatch} />
      </Switch>
    </Router>,
    document.getElementById("root")
  )
}


(async () => {
   const OwnerData = await getOwners();
   const BenchmarkData = await getBenchmarks();
   const AssetClassData = await getAssetClasses();
   const AccountData = await getAccounts();
   const InvestmentData = await getInvestments();
   render(OwnerData, BenchmarkData, AssetClassData, AccountData, InvestmentData);
})()
