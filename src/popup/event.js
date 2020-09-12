import React, { lazy, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
import {getContributionsId} from '../serverAPI/contributions.js'
import {getDistributionsId} from '../serverAPI/distributions.js'
import {getCommissionsId} from '../serverAPI/commissions.js'
import {getTransfersId} from '../serverAPI/transfers.js'
import {getSingleEntry} from '../serverAPI/singleEntry.js'
const NewPopup = lazy(() => import('./popupNew'));
const EditPopup = lazy(() => import("./popupEdit.js"))

function capitalize_Words(str) {
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

const Event = (props) => {
  const [data, setData] = useState(null);

  async function fetchExistingData() {
    let data = undefined;
    switch (props.match.params.type) {
      case 'DISTRIBUTION':
        data = await getDistributionsId(props.match.params.data)
        break
      case 'CONTRIBUTION':
        data = await getContributionsId(props.match.params.data)
        break
      case 'COMMISH':
        data = await getCommissionsId(props.match.params.data)
        break
      case 'TRANSFER':
        data = await getTransfersId(props.match.params.data)
        break
      default:
        data = await getSingleEntry(props.match.params.data)
    }
    Object.keys(data).map(key => {
      const splitKey = key.replace(new RegExp('_', 'g'), ' ');
      let capitalKey = capitalize_Words(splitKey);
      if (key.includes('date')) {
          data[capitalKey] = data[key].slice(0,10);
          if (capitalKey === 'Date Sent') {
            data['Contra Date'] = data[key].slice(0,10);
          }
      }
      else {
        if (['Main', 'Fees', 'Tax',
          'Outside Main', 'Outside Fees', 'Outside Tax',
          'Recallable', 'Withhold'].includes(capitalKey)) {
            capitalKey = capitalKey + ' $';
          }
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

  if (props.match.params.data !== undefined) {
    const initial = {
      dropdownOptions: ['INFLOW', 'OUTFLOW', 'EXPENSE', 'CREDIT', 'DIV', 'GAIN', 'COMMISH'],
      investmentID: props.match.params.id,
      dataID: props.match.params.data,
      transactionType: props.match.params.type
    }

    if (data === null) {
      return null;
    }
    return (
      <EditPopup initial={initial} data={data}/>
    )
  }
  return (
    <NewPopup getInvestmentData={getInvestments}
    dropdownOptions={['INFLOW', 'OUTFLOW', 'EXPENSE', 'CREDIT', 'DIV', 'GAIN', 'COMMISH']}
    investmentID={props.match.params.id}
    linkedInvestment={props.match.params.linkedID}
    dataID={props.match.params.data}
    dataType={props.match.params.type} />
  )
}

export default Event;
