import React, { lazy, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
import {getTransfersId} from '../serverAPI/transfers.js'
const NewPopup = lazy(() => import('./popupNew'));
const EditPopup = lazy(() => import("./popupEdit.js"))

function capitalize_Words(str) {
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

const Transfer = (props) => {
  const [data, setData] = useState(null);

  async function fetchExistingData() {
    let data = await getTransfersId(props.match.params.dataID)
    Object.keys(data).map(key => {
      const splitKey = key.replace(new RegExp('_', 'g'), ' ');
      let capitalKey = capitalize_Words(splitKey);
      if (key.includes('date')) {
        data[capitalKey] = data[key].slice(0,10);
      }
      else {
        data[capitalKey] = data[key];
      }
    })
    setData(data);
  }

  useEffect(() => {
    fetchExistingData().catch(e =>
      setData(null)
    )
  }, [])

  if (props.match.params.dataID !== undefined) {
    const initial = {
      dropdownOptions: ['TRANSFER'],
      dataID: props.match.params.dataID,
      transactionType: 'TRANSFER'
    }

    if (data === null) {
      return null;
    }
    return (
      <EditPopup initial={initial} data={data}/>
    )
  }
  return (
    <NewPopup getInvestmentData={getInvestments} transcationType={'TRANSFER'} dropdownOptions={['TRANSFER']} />
  )
}

export default Transfer;
