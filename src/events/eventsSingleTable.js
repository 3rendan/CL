import React, {Fragment, useState, useEffect, useRef} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntry, SingleEntryColumns} from '../serverAPI/singleEntry.js'


import {getDistributionsInvestment, DistributionColumns} from '../serverAPI/distributions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getContributionsInvestment, ContributionColumns} from '../serverAPI/contributions.js'
import {getCommissionsInvestment, CommissionColumns} from '../serverAPI/commissions.js'

import MaintenanceTable from './allTables'


const moneyColumns = ['Net Amount']

const eventColumns = ['Type', 'Date Due', 'Date Sent',
    'To/From Account',
    ...moneyColumns,
    'Notes']

const EventTable = (props) => {
  const [EventData, setEventData] = useState(null);
  const [key, setKey] = useState(0);
  const [error, setError] = useState(null);

  const investmentName = props.investment;
  const investmentID = props.investmentID;


  useEffect(() => {
    async function fetchData() {
      let singleEntrys = await getSingleEntrys(investmentID);
      singleEntrys = singleEntrys ? singleEntrys : [];
      const copySingle = [...singleEntrys.map(transfer => { return {...transfer} })]
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

      distributions = distributions.map((dist) => {
        dist['type'] = 'DISTRIBUTION'
        if (dist.investment === investmentID) {
          dist.investment = dist.from_investment
        }
        return dist;
      })

      let contributions = await getContributionsInvestment(investmentID);
      contributions = contributions ? contributions : [];

      contributions = contributions.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
        console.log(contr)
        if (contr.investment === investmentID) {
          contr.investment = contr.from_investment
          contr.net_amount = -1 * contr.net_amount;
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
  return (<MaintenanceTable name={"Events"} data={EventData}
            columns={eventColumns} hasCommitment={false}
            investmentID={investmentID}
            linkedInvestmentID={props.linkedInvestmentID}
            moneyColumns={moneyColumns}
            key={key}/>);
};

export default EventTable;
