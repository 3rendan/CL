import {SingleEntry, insertSingleEntry} from './singleEntry'
import {Transfer, insertTransfer} from './transfers'

const createEvent = (props) => {
  const state = props.state
  const netAmount = props.netAmount

  if (state.Type === 'TRANSFER') {
    console.log(state)
    const newTransfer = new Transfer(state);
    insertTransfer(newTransfer);
  }
  else if (state.Type === 'DISTRIBUTION') {

  }
  else if (state.Type === 'CONTRIBUTION') {

  }
  else {
    const newEntry = new SingleEntry(state);
    console.log(state);
    insertSingleEntry(newEntry);
  }

};




export {
  createEvent
}
