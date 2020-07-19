import React, { Fragment, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom';

import Spinner from 'react-bootstrap/Spinner'
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
const Calendar = lazy(() => import('./calendar/calendar'));
const Backup = lazy(() => import('./backup'))

const EventPopup = lazy(() => import("./popup/event.js"))
const EventCommitmentPopup = lazy(() => import("./popup/eventCommitment.js"))
const NavEventPopup = lazy(() => import("./popup/navEvent.js"))
const TransferPopup = lazy(() => import("./popup/transfer.js"))

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
    <Suspense fallback={<Spinner />}>
      <Switch>
        <Route path="/investments">
          <ViewOnlyInvestmentTable />
        </Route>
        <Route path="/calendar" component={Calendar} />
        // EVENTS AND TRANSFERS
        <Route path="/transfers" component={TransfersTable} />
        <Route path="/events/:investment/:id"    component={EventsPage}   />
        // MAINTENANCE
        <Route path="/maintenance/accountInvestment">
          <InvestmentTable />
          <AccountTable    />
        </Route>
        <Route path="/maintenance/AssetsBenchmarksOwners">
          <AssetClassTable />
          <OwnerTable      />
          <BenchmarkTable  />
        </Route>
        // POPUPs
        <Route path="/popup/event/commitment/:id" component={EventCommitmentPopup}  />
        <Route path="/popup/event/:id" component={EventPopup} />
        <Route path="/popup/NAVevent/:id" component={NavEventPopup} />
        <Route path="/popup/transfer" component={TransferPopup}  />
        <Route path="/backup" component={Backup} />
        <Route path="/report/accountBalance"  component={AccountBalanceReport} />
        <Route path="/report/assetAllocation" component={Backup} />
        <Route path="/report/summary"         component={Backup} />
        <Route path="/" component={NoMatch} />
      </Switch>
    </Suspense>
  </Router>,
  document.getElementById("root")
)
