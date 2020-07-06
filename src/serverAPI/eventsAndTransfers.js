import {SingleEntry, insertSingleEntry} from './singleEntry'

const createEvent = (props) => {
  const state = props.state
  const netAmount = props.netAmount

  const newEntry = new SingleEntry(state);
  insertSingleEntry(newEntry);
};




export {
  createEvent
}
