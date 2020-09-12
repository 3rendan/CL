import React, { lazy } from 'react';
import ReactDOM from 'react-dom';

import {getInvestments} from '../serverAPI/investments.js'
const NewPoppup = lazy(() => import('./popupNew'));
const EditPopup = lazy(() => import("./popupEdit.js"))

const NAVEvent = (props) => {
  console.log(props)
  if (props.match.params.data !== undefined) {
    return (
      <EditPopup
      transcationType={'NAV'}
       dropdownOptions={['NAV']}
      investmentID={props.match.params.id}
      dataID={props.match.params.data}
      dataType={'NAV'}
      />
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
