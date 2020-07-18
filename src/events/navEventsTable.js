import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntry, getNAVEvents, NAVColumns} from '../serverAPI/singleEntry.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const NAVEventTable = (props) => {
  const [NAVEventData, setNAVEventData] = useState(null);
  const [key, setKey] = useState(0);
  const investmentName = props.investment;
  const investmentID = props.investmentID;

  ipcRenderer.on('replyNAVEvent', (event, message) => {
    let copyTableData = [message]
    if (NAVEventData !== null) {
      copyTableData = [...NAVEventData, message]
    }
    console.log('new key')
    setNAVEventData(copyTableData);
    setKey(key => key + 1)
  });


  useEffect(() => {
    async function fetchData() {
      const result = await getNAVEvents(investmentID);
      setNAVEventData(result);
    }
    fetchData();

  }, [key]);

  if (NAVEventData === null) {
    return null;
  }
  return (<MaintenanceTable
            name={"NAVEvent"} data={NAVEventData}
            columns={NAVColumns} investmentID={investmentID}/>);
};

export default NAVEventTable;
