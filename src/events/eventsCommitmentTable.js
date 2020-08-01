import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntryColumns} from '../serverAPI/singleEntry.js'

import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'

import MaintenanceTable from './allTables'


const moneyColumns = ['Net Amount', 'Main',
'Recallable',	'Withhold',
'Fees', 'Tax', 'Outside Main', 'Outside Fees', 'Outside Tax', 'Net Commitment']

const eventColumns = ['Type', 'Date Due', 'Date Sent',
    'Investment',
    ...moneyColumns,
    'Notes']

const EventTable = (props) => {
  const [EventData, setEventData] = useState(null);
  const [error, setError] = useState(null);

  const investmentName = props.investment;
  const investmentID = props.investmentID;
  const [key, setKey] = useState(0);

  useEffect(() => {
    async function fetchData() {
      let singleEntry = await getSingleEntrys(investmentID);
      singleEntry = singleEntry ? singleEntry : [];
      let commission = await getCommissionsInvestment(investmentID);
      commission = commission ? commission : [];
      commission = commission.map((comm) => {
        comm['type'] = 'COMMISH'
        return comm;
      })
      let distribution = await getDistributionsInvestment(investmentID);
      distribution = distribution ? distribution : [];
      distribution = distribution.map((dist) => {
        dist['type'] = 'DISTRIBUTION'
        return dist;
      })

      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      contribution = contribution.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
        return contr;
      })

      let transfers = await getTransfers(investmentID);
      transfers = transfers.map((transfer) => {
        transfer['type'] = 'TRANSFER'
        return transfer;
      })

      setEventData([...singleEntry, ...commission,
            ...distribution, ...contribution, ...transfers]);
    }
    fetchData().catch(e =>
      setError(e)
    )

  }, [key]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (EventData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Event"} data={EventData}
            columns={eventColumns} hasCommitment={true}
            commitment={props.commitment}
            frozenColumns={props.frozenColumns}
            investmentID={investmentID}
            moneyColumns = {moneyColumns}/>);
};

export default EventTable;
