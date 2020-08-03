import {SingleEntry, insertSingleEntry, updateSingleEntry} from './singleEntry'
import {Commission, insertCommission, updateCommission} from './commissions'
import {Distribution, insertDistribution, updateDistribution} from './distributions'
import {Contribution, insertContribution, updateContribution} from './contributions'
import {Transfer, insertTransfer, updateTransfer} from './transfers'

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

const updateEvent = (props) => {
  const state = props.state
  const netAmount = props.netAmount
  state.id = state.Id;
  var newEntry = null;
  if (state.Type === 'TRANSFER') {
    newEntry = new Transfer(state);
    updateTransfer(newEntry);
  }
  else if (state.Type === 'DISTRIBUTION') {
    newEntry = new Distribution(state);
    updateDistribution(newEntry);
  }
  else if (state.Type === 'CONTRIBUTION') {
    newEntry = new Contribution(state);
    updateContribution(newEntry);
  }
  else if (state.Type === 'COMMISH') {
    newEntry = new Commission(state);
    updateCommission(newEntry);
  }
  else {
    newEntry = new SingleEntry(state);
    updateSingleEntry(newEntry);
  }

  return newEntry;

};


export {
  createEvent,
  updateEvent
}
