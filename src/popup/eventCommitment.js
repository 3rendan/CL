import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const FormSheet = lazy(() => import('./popup'));
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
    <FormSheet getInvestmentData={getInvestments}
    dropdownOptions={['INFLOW', 'OUTFLOW', 'EXPENSE', 'CREDIT', 'DIV', 'GAIN', 'COMMISH', 'DISTRIBUTION', 'CONTRIBUTION']}
    investmentID={props.match.params.id}
    dataID={props.match.params.data}
    dataType={props.match.params.type} />
  )
}

export default EventCommitment;
