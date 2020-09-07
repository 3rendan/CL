import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const NewPopup = lazy(() => import('./popup'));
const FilledFormSheet = lazy(() => import("./popupFilled.js"))

const Transfer = (props) => {
  if (props.match.params.dataID !== undefined) {
    return (
      <FilledFormSheet
      dataID={props.match.params.dataID}
      dataType="TRANSFER"/>
    )
  }
  return (
    <NewPopup getInvestmentData={getInvestments} transcationType={'TRANSFER'} dropdownOptions={['TRANSFER']} />
  )
}

export default Transfer;
