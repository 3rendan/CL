import React, { Fragment, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';


import LoadingFallback from './LoadingFallbackPage'
import './index.css';
import { HashRouter as Router, Route, Switch } from 'react-router-dom'

const NoMatch = () => {
  return <h1> No Match </h1>
}

const AssetClassTable = lazy(() => import('./tables/AssetClassTable'));
const AccountTable = lazy(() => import('./tables/AccountTable'));
const BenchmarkTable = lazy(() => import('./tables/BenchmarkTable'));
const InvestmentTable = lazy(() => import('./tables/InvestmentTable'));
const ViewOnlyInvestmentTable = lazy(() => import('./tables/ViewOnlyInvestmentTable'));
const OwnerTable = lazy(() => import('./tables/OwnerTable'));


const EventsTable = lazy(() => import("./events/eventsTable"));
const NAVEventsTable = lazy(() => import("./events/navEventsTable"));
const NAVTable = lazy(() => import("./events/navTable"));
const TransfersTable = lazy(() => import("./events/transfersTable"));

const AccountBalanceReport = lazy(() => import('./reports/AccountBalanceReport'));
const AssetAllocationReport = lazy(() => import('./reports/AssetAllocationReport'));
const SummaryReport = lazy(() => import('./reports/SummaryReport'));
const Calendar = lazy(() => import('./calendar/calendar'));
const Backup = lazy(() => import('./backup'))

const EventPopup = lazy(() => import("./popup/event.js"))
const EventCommitmentPopup = lazy(() => import("./popup/eventCommitment.js"))
const NavEventPopup = lazy(() => import("./popup/navEvent.js"))
const TransferPopup = lazy(() => import("./popup/transfer.js"))

const Connection = lazy(() => import('./connection'))

const EventsPage = (props) => {
  return (
    <Fragment>
      <h1> Investment = {props.match.params.investment} </h1>
      <EventsTable investment={props.match.params.investment}
                    investmentID = {props.match.params.id}/>
      <NAVEventsTable investment={props.match.params.investment}
                      investmentID = {props.match.params.id}/>
      <NAVTable investment={props.match.params.investment}
                      investmentID = {props.match.params.id}/>
    </Fragment>
  )
}


// render
ReactDOM.render(
  <Router>
    <Suspense fallback={LoadingFallback}>
      <Switch>
        <Route path="/connection">
          <Connection />
        </Route>
        <Route path="/investments">
          <ViewOnlyInvestmentTable />
        </Route>
        <Route path="/calendar" component={Calendar} />
        // EVENTS AND TRANSFERS
        <Route path="/transfers" component={TransfersTable} />
        <Route path="/events/:investment/:id"    component={EventsPage}   />
        // MAINTENANCE
        <Route path="/maintenance/accountInvestment">
          <AccountTable    />
          <OwnerTable      />
          <InvestmentTable />
        </Route>
        <Route path="/maintenance/AssetsBenchmarksOwners">
          <AssetClassTable />
          <BenchmarkTable  />
        </Route>
        // POPUPs
        <Route path="/popup/event/commitment/edit/:id/:data/:type" component={EventCommitmentPopup}  />
        <Route path="/popup/event/edit/:id/:data/:type" component={EventPopup} />
        <Route path="/popup/event/commitment/:id" component={EventCommitmentPopup}  />
        <Route path="/popup/event/:id" component={EventPopup} />
        <Route path="/popup/NAVevent/:id" component={NavEventPopup} />
        <Route path="/popup/transfer" component={TransferPopup}  />
        <Route path="/backup" component={Backup} />
        <Route path="/report/accountBalance"  component={AccountBalanceReport} />
        <Route path="/report/assetAllocation" component={AssetAllocationReport} />
        <Route path="/report/summary"         component={SummaryReport} />
        <Route path="/" component={NoMatch} />
      </Switch>
    </Suspense>
  </Router>,
  document.getElementById("root")
)
