import React, { lazy, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
import {getSingleEntry} from '../serverAPI/singleEntry'
const NewPoppup = lazy(() => import('./popupNew'));
const EditPopup = lazy(() => import("./popupEdit.js"))

function capitalize_Words(str) {
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

const NAVEvent = (props) => {
  const [data, setData] = useState(null);

  async function fetchExistingData() {
    console.log(props.match.params.data)
    let data = await getSingleEntry(props.match.params.data)
    console.log(data)
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

  if (props.match.params.data !== undefined) {
    const initial = {
      dropdownOptions: ['NAV'],
      investmentID: props.match.params.id,
      dataID: props.match.params.data,
      transactionType: 'NAV'
    }

    if (data === null) {
      return null;
    }
    console.log(data)
    return (
      <EditPopup initial={initial} data={data} />
    )
  }
  return (
    <NewPoppup getInvestmentData={getInvestments}
          transcationType={'NAV'}
           dropdownOptions={['NAV']}
           investmentID={props.match.params.id}/>
  )
}

export default NAVEvent;
