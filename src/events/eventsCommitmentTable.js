import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntryColumns} from '../serverAPI/singleEntry.js'

import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const moneyColumns = ['Net Amount', 'Main',
'Recallable',	'Withhold',
'Fees', 'Tax', 'Outside Main', 'Outside Fees', 'Outside Tax', 'Net Commitment']

const eventColumns = ['Type', 'Date Due', 'Date Sent',
    'Investment', 'From Investment',
    ...moneyColumns,
    'Notes']

const EventTable = (props) => {
  const [EventData, setEventData] = useState(null);
  const investmentName = props.investment;
  const investmentID = props.investmentID;
  const [key, setKey] = useState(0);


  ipcRenderer.on('replyEvent', (event, message) => {
    let copyTableData = [message]
    if (EventData !== null) {
      copyTableData = [...EventData, message]
    }
    setEventData(copyTableData);
    setKey(key => key + 1);
  });


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

      setEventData([...singleEntry, ...commission, ...distribution, ...contribution]);
    }
    fetchData();

  }, [key]);

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
