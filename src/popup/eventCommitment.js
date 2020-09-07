import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const NewPopup = lazy(() => import('./popupNew'));
const FilledFormSheet = lazy(() => import("./popupFilled.js"))

const EventCommitment = (props) => {
  if (props.match.params.data !== undefined) {
    return (
      <FilledFormSheet
      dropdownOptions={['INFLOW', 'OUTFLOW', 'EXPENSE', 'CREDIT', 'DIV', 'GAIN', 'COMMISH', 'DISTRIBUTION', 'CONTRIBUTION']}
      investmentID={props.match.params.id}
      dataID={props.match.params.data}
      dataType={props.match.params.type} />
    )
  }
  return (
    <NewPopup getInvestmentData={getInvestments}
    dropdownOptions={['INFLOW', 'OUTFLOW', 'EXPENSE', 'CREDIT', 'DIV', 'GAIN', 'COMMISH', 'DISTRIBUTION', 'CONTRIBUTION']}
    investmentID={props.match.params.id}
    linkedInvestment={props.match.params.linkedID}
    dataID={props.match.params.data}
    dataType={props.match.params.type} />
  )
}

export default EventCommitment;
