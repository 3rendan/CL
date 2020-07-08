import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getSingleEntrys, SingleEntry, getNAVEvents, NAVColumns} from '../serverAPI/singleEntry.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;

const NAVEventTable = (props) => {
  const [NAVEventData, setNAVEventData] = useState(null);
  const investmentName = props.investment;
  const investmentID = props.investmentID;

  ipcRenderer.on('replyNAVEvent', (event, message) => {
    let copyTableData = [new SingleEntry(message)]
    if (NAVEventData !== null) {
      copyTableData = [...NAVEventData, new SingleEntry(message)]
    }

    console.log(copyTableData)
    setNAVEventData(copyTableData);
  });


  useEffect(() => {
    async function fetchData() {
      const result = await getNAVEvents(investmentID);
      setNAVEventData(result);
    }
    fetchData();

  }, []);

  if (NAVEventData === null) {
    return null;
  }
  return (<MaintenanceTable name={"NAVEvent"} data={NAVEventData} columns={NAVColumns}/>);
};

export default NAVEventTable;
