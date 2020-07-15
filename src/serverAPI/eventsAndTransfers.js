import {SingleEntry, insertSingleEntry} from './singleEntry'
import {Commission, insertCommission} from './commissions'
import {Distribution, insertDistribution} from './distributions'
import {Contribution, insertContribution} from './contributions'
import {Transfer, insertTransfer} from './transfers'

const createEvent = (props) => {
  const state = props.state
  const netAmount = props.netAmount
  console.log(state.Type)
  var newEntry = null;
  if (state.Type === 'TRANSFER') {
    newEntry = new Transfer(state);
    insertTransfer(newEntry);
  }
  else if (state.Type === 'DISTRIBUTION') {
    newEntry = new Distribution(state);
    insertDistribution(newEntry);
  }
  else if (state.Type === 'CONTRIBUTION') {
    newEntry = new Contribution(state);
    insertContribution(newEntry);
  }
  else if (state.Type === 'COMMISH') {
    newEntry = new Commission(state);
    insertCommission(newEntry);
  }
  else {
    newEntry = new SingleEntry(state);
    insertSingleEntry(newEntry);
  }

  return newEntry;

};




export {
  createEvent
}
