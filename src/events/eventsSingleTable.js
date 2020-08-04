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
    'Investment',
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
      // const copySingle = [...singleEntrys.map(transfer => { return {...transfer} })]
      // console.log(copySingle)
      singleEntrys = singleEntrys.map((entry) => {
        if (entry.from_investment === investmentID) {
          entry.from_investment = entry.investment
        }
        else if (entry.investment === investmentID) {
          entry.investment = entry.from_investment
        }
        return entry;
      })

      let commissions = await getCommissionsInvestment(investmentID);
      commissions = commissions ? commissions : [];
      commissions = commissions.map((comm) => {
        comm['type'] = 'COMMISH'
        if (comm.from_investment === investmentID) {
          comm.from_investment = comm.investment
        }
        else if (comm.investment === investmentID) {
          comm.investment = comm.from_investment
        }
        return comm;
      })

      let transfers = await getTransfers(investmentID);
      const copyTransfers = [...transfers.map(transfer => { return {...transfer} })]
      console.log(copyTransfers)
      console.log(investmentID)
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

      setEventData([...singleEntrys, ...commissions, ...transfers]);
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
            columns={eventColumns} hasCommitment={false}
            investmentID={investmentID}
            moneyColumns={moneyColumns}
            key={key}/>);
};

export default EventTable;
