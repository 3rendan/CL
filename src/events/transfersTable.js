import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import {getAllTransfers, Transfer, TransferColumns} from '../serverAPI/transfers.js'

import MaintenanceTable from './allTables'

const TransferTable = (props) => {
  const [TransferData, setTransferData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      let result = await getAllTransfers();
      if (!result) {
        throw 'Server Disconnected: Null Transfers'
      }
      setTransferData(result);
    }
    fetchData().catch(e =>
      setError(e)
    )

  }, []);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (TransferData === null) {
    return null;
  }
  return (<MaintenanceTable name={"Transfers"}
            data={TransferData} columns={TransferColumns}/>);
};

export default TransferTable;
