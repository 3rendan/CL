import {SingleEntry, insertSingleEntry} from './singleEntry'
import {Distribution, insertDistribution} from './distributions'
import {Contribution, insertContribution} from './contributions'
import {Transfer, insertTransfer} from './transfers'

const createEvent = (props) => {
  const state = props.state
  const netAmount = props.netAmount
  console.log(state.Type)
  if (state.Type === 'TRANSFER') {
    const newTransfer = new Transfer(state);
    insertTransfer(newTransfer);
  }
  else if (state.Type === 'DISTRIBUTION') {
    const newDistribution = new Distribution(state);
    insertDistribution(newDistribution);
  }
  else if (state.Type === 'CONTRIBUTION') {
    const newContribution = new Contribution(state);
    insertContribution(newContribution);
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
