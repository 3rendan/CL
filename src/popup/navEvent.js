import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const FormSheet = lazy(() => import('./popup'));
const FilledFormSheet = lazy(() => import("./popupFilled.js"))

const NAVEvent = (props) => {
  console.log(props)
  if (props.match.params.data !== undefined) {
    return (
      <FilledFormSheet
      transcationType={'NAV'}
       dropdownOptions={['NAV']}
      investmentID={props.match.params.id}
      dataID={props.match.params.data}
      dataType={'NAV'}
      />
    )
  }
  return (
    <FormSheet getInvestmentData={getInvestments}
          transcationType={'NAV'}
           dropdownOptions={['NAV']}
           investmentID={props.match.params.id}/>
  )
}

export default NAVEvent;
