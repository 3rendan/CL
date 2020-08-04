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
      let singleEntrys = await getSingleEntrys(investmentID);
      singleEntrys = singleEntrys ? singleEntrys : [];
      const copySingle = [...singleEntrys.map(transfer => { return {...transfer} })]
      console.log(copySingle)
      singleEntrys = singleEntrys.map((entry) => {
        if (entry.investment === investmentID) {
          entry.investment = entry.from_investment
        }
        return entry;
      })


      let commissions = await getCommissionsInvestment(investmentID);
      commissions = commissions ? commissions : [];
      commissions = commissions.map((comm) => {
        comm['type'] = 'COMMISH'
        if (comm.investment === investmentID) {
          comm.investment = comm.from_investment
        }
        return comm;
      })
      let distributions = await getDistributionsInvestment(investmentID);
      distributions = distributions ? distributions : [];

      const copyDist = [...distributions.map(transfer => { return {...transfer} })]
      console.log(copyDist)

      distributions = distributions.map((dist) => {
        dist['type'] = 'DISTRIBUTION'
        if (dist.investment === investmentID) {
          dist.investment = dist.from_investment
        }
        return dist;
      })

      let contributions = await getContributionsInvestment(investmentID);
      contributions = contributions ? contributions : [];

      const copyContr = [...contributions.map(transfer => { return {...transfer} })]
      console.log(copyContr)

      contributions = contributions.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
        if (contr.investment === investmentID) {
          contr.investment = contr.from_investment
        }
        return contr;
      })

      let transfers = await getTransfers(investmentID);
      transfers = transfers.map((transfer) => {
        transfer['type'] = 'TRANSFER'
        if (transfer.from_investment === investmentID) {
          transfer.amount = -transfer.amount;
        }
        if (transfer.to_investment === investmentID) {
          transfer.to_investment = transfer.from_investment
        }
        return transfer;
      })

      setEventData([...singleEntrys, ...commissions,
            ...distributions, ...contributions, ...transfers]);
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
