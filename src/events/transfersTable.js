import React, {useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getAllTransfers, Transfer, TransferColumns} from '../serverAPI/transfers.js'

import MaintenanceTable from './allTables'

const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;


const TransferTable = (props) => {
  const [TransferData, setTransferData] = useState(null);

  ipcRenderer.on('replyTransfer', (event, message) => {
    let copyTableData = [new Transfer(message)]
    if (TransferData !== null) {
      copyTableData = [...TransferData, new Transfer(message)]
    }

    setTransferData(copyTableData);
  });


  useEffect(() => {
    async function fetchData() {
      let result = await getAllTransfers();
      console.log(result)
      setTransferData(result);
    }
    fetchData();

  }, []);

  if (TransferData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Transfer"}
            data={TransferData} columns={TransferColumns}/>);
};

export default TransferTable;
