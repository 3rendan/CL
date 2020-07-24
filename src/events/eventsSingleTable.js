import React, {useState, useEffect, useRef} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntry, SingleEntryColumns} from '../serverAPI/singleEntry.js'


import {getDistributionsInvestment, DistributionColumns} from '../serverAPI/distributions.js'
import {getContributionsInvestment, ContributionColumns} from '../serverAPI/contributions.js'
import {getCommissionsInvestment, CommissionColumns} from '../serverAPI/commissions.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const moneyColumns = ['Net Amount']

const eventColumns = ['Type', 'Date Due', 'Date Sent',
    'Investment', 'From Investment',
    ...moneyColumns,
    'Notes']

const EventTable = (props) => {
  const [EventData, setEventData] = useState(null);
  const [key, setKey] = useState(0);
  const investmentName = props.investment;
  const investmentID = props.investmentID;


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
      setEventData([...singleEntry, ...commission]);
    }
    fetchData();

  }, [key]);

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
