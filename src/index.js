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
const BenchmarkReturnsTable = lazy(() => import('./tables/BenchmarkReturns'));
const InvestmentTable = lazy(() => import('./tables/InvestmentTable'));
const OwnerTable = lazy(() => import('./tables/OwnerTable'));


const EventsTable = lazy(() => import("./events/eventsTable"));
const NAVEventsTable = lazy(() => import("./events/navEventsTable"));
const NAVTable = lazy(() => import("./events/navTable"));
const TransfersTable = lazy(() => import("./events/transfersTable"));

const AccountBalanceReport = lazy(() => import('./reports/AccountBalanceReport'));
const OwnerBalanceReport = lazy(() => import('./reports/OwnerBalanceReport'));
const AssetAllocationReport = lazy(() => import('./reports/AssetAllocationReport'));
const SummaryReport = lazy(() => import('./reports/SummaryReport'));
const SummaryUnexplainedGainReport = lazy(() => import('./reports/SummaryUnexplainedGainReport'));
const SummaryPL_LTDReport = lazy(() => import('./reports/SummaryPL_LTDReport'));
const SummaryPL_MTDReport = lazy(() => import('./reports/SummaryPL_MTDReport'));
const Calendar = lazy(() => import('./calendar/calendar'));
const InvestmentNAVReport = lazy(() => import('./reports/InvestmentNAVReport'));
const Backup = lazy(() => import('./backup'))

const EventPopup = lazy(() => import("./popup/event"))
const EventCommitmentPopup = lazy(() => import("./popup/eventCommitment"))
const NavEventPopup = lazy(() => import("./popup/navEvent"))
const TransferPopup = lazy(() => import("./popup/transfer"))

const QuickInsertNAV = lazy(() => import("./quickInsertNAV"))

const Connection = lazy(() => import('./connection'))

const EventsPage = (props) => {
  return (
    <Fragment>
      <EventsTable investmentID = {props.match.params.id}/>
      <NAVEventsTable investmentID = {props.match.params.id}/>
      <NAVTable investmentID = {props.match.params.id}/>
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
          <InvestmentTable readOnly={true} />
        </Route>
        <Route path="/report/calendar" component={Calendar} />
        // EVENTS AND TRANSFERS
        <Route path="/transfers" component={TransfersTable} />
        <Route path="/events/:id"    component={EventsPage}   />
        <Route path="/quickNAV" component={QuickInsertNAV} />
        // MAINTENANCE
        <Route path="/maintenance/accountInvestment">
          <AccountTable    />
          <OwnerTable      />
          <InvestmentTable readOnly={false} />
          <br />
          <br />
        </Route>
        <Route path="/maintenance/AssetsBenchmarksOwners">
          <AssetClassTable />
          <BenchmarkTable  />
          <br />
          <br />
        </Route>
        <Route path="/maintenance/BenchmarkReturns">
          <BenchmarkReturnsTable />
          <br />
        </Route>
        // POPUPs
        <Route path="/popup/event/commitment/edit/:id/:data/:type" component={EventCommitmentPopup}  />
        <Route path="/popup/event/edit/:id/:data/:type" component={EventPopup} />
        <Route path="/popup/NAVevent/edit/:id/:data" component={NavEventPopup} />
        <Route path="/popup/event/commitment/:id/:linkedID" component={EventCommitmentPopup}  />
        <Route path="/popup/event/:id/:linkedID" component={EventPopup} />
        <Route path="/popup/NAVevent/:id" component={NavEventPopup} />
        <Route path="/popup/transfer/edit/:dataID" component={TransferPopup}  />
        <Route path="/popup/transfer" component={TransferPopup}  />
        <Route path="/backup" component={Backup} />
        <Route path="/report/accountBalance"  component={AccountBalanceReport} />
        <Route path="/report/ownerBalance"  component={OwnerBalanceReport} />
        <Route path="/report/investmentNAV"  component={InvestmentNAVReport} />
        <Route path="/report/assetAllocation" component={AssetAllocationReport} />
        <Route path="/report/summary"         component={SummaryReport} />
        <Route path="/report/summaryPL/LTD"         component={SummaryPL_LTDReport} />
        <Route path="/report/summaryPL/MTD"         component={SummaryPL_MTDReport} />
        <Route path="/report/summaryUnexplainedGainReport"  component={SummaryUnexplainedGainReport} />
        <Route path="/" component={NoMatch} />
      </Switch>
    </Suspense>
  </Router>,
  document.getElementById("root")
)
