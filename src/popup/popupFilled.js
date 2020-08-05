import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from "react-dom";

import {getContributionsId} from '../serverAPI/contributions.js'
import {getDistributionsId} from '../serverAPI/distributions.js'
import {getCommissionsId} from '../serverAPI/commissions.js'
import {getTransfersId} from '../serverAPI/transfers.js'
import {getSingleEntry} from '../serverAPI/singleEntry.js'

import {getInvestments} from '../serverAPI/investments.js'

import moment from 'moment'

import FormSheet from './popup'

function capitalize_Words(str) {
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


async function getEventFromID(dataID, dataType) {
  switch (dataType) {
    case 'CONTRIBUTION':
      return await getContributionsId(dataID);
    case 'DISTRIBUTION':
      return await getDistributionsId(dataID);
    case 'TRANSFER':
      return await getTransfersId(dataID);
    case 'COMMISH':
      return await getCommissionsId(dataID);
    default: // single entry transaction details
      return await getSingleEntry(dataID);
  }
}

const FilledFormSheet = (props) => {
  // this is only for edited data
  const dataType = props.dataType
  const dataID = props.dataID

  const [state, setState] = useState({})

  let options = [];
  if (dataType === 'TRANSFER') {
      options = ['TRANSFER']
  }
  else {
    options = ['INFLOW', 'OUTFLOW', 'EXPENSE', 'CREDIT', 'DIV', 'GAIN', 'COMMISH', 'DISTRIBUTION', 'CONTRIBUTION']
  }

  useEffect(() => {
    // if edit data
    if (dataID !== undefined && dataType !== undefined) {
      async function getData() {
        const result = await getEventFromID(dataID, dataType);
        if (!result) {
          throw 'Server Disconnected: Investment data null'
        }
        const keys = Object.keys(result);
        const nameToValue = {}
        keys.map(key => {
          const name = key.replace(new RegExp('_', 'g'), ' ');
          let capitalName = capitalize_Words(name)

          // fix date formatting
          if (capitalName.includes('Date')) {
            const date = new Date(result[key])
            let month = (date.getMonth() + 1);
            if (month < 10) {
              month = '0' + month;
            }
            let day = (date.getDate() + 1);
            if (day < 10) {
              day = '0' + day;
            }
            const formatDate = date.getFullYear() + '-' + month + '-' + day
            result[key] = formatDate;
          }

          // fix amount names
          const amountNames = ['Main', 'Fees', 'Tax',
            'Outside Main', 'Outside Fees', 'Outside Tax',
            'Recallable', 'Withhold']
          if (amountNames.includes(capitalName)) {
            capitalName += ' $'
          }
          nameToValue[capitalName] = result[key]
        })
        setState(nameToValue);
      }
      getData();
    }
  }, [])


  if (Object.keys(state).length !== 0) {
    console.log(state)
    return <FormSheet getInvestmentData={getInvestments} key={'filled'}
                      initial={state}
     transcationType={props.dataType} dropdownOptions={options} />
  }
  return null;
}

export default FilledFormSheet;
