import React, {Fragment, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import moment from 'moment';

import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'

import {Backup, getBackups, insertBackup,
  deleteBackup, restore} from './serverAPI/backups.js'

const electron = window.require('electron');
const dialog = electron.remote.dialog

const createBackup = (setKey) => {
  const backup = new Backup();
  async function insertAndFetch() {
    await insertBackup(backup);
    setKey(key => key+1)
  };
  insertAndFetch();
}


const BackupItem = (props) => {
  const backup = props.backup;
  const [showSelf, setShowSelf] = useState(true);

  if (!showSelf) {
    return null;
  }

  return (
    <Fragment>
      <ListGroup.Item key={backup.id}>
        {moment(backup.date).format('LLL')}
        <button type="button" style = {{marginLeft: "25px"}} onClick={() =>   {
          //Minimum options object
          let options  = {
           buttons: ["Yes","No"],
           message: 'Confirm Restore?'
          }
          const confirmed = dialog.showMessageBoxSync(options)
          // const confirmed = window.confirm('Confirm Restore?')
          if (confirmed === 1) {
            return
          }
          restore(backup.id)

          }
          }
        className="btn btn-success btn-lg">Restore Backup</button>
        <button type="button" style = {{marginLeft: "25px"}} onClick={() => {
          let options  = {
           buttons: ["Yes","No"],
           message: 'Confirm Delete?'
          }
          const confirmed = dialog.showMessageBoxSync(options)
          // const confirmed = window.confirm('Confirm Delete?')
          if (confirmed == 1) {
            return
          }
          deleteBackup(backup.id)
          setShowSelf(false)
          // CALL DELETE HERE
          }
          }
        className="btn btn-danger btn-lg">Delete Backup</button>
      </ListGroup.Item>
    </Fragment>
  )
}

const BackupList = (props) => {
  const backups = props.events;
  const backupItems = backups.map(backup =>
    <BackupItem key={backup.id} backup={backup}/>
  );
  return ( <ListGroup> {backupItems} </ListGroup>)
}

const BackupHeader = (props) => {
  return (
    <Fragment>
      <h1> Backups - Click to Backup </h1>
      <Button variant="success" size="lg" onClick={() => createBackup(props.setKey)}> Backup </Button>
      <br />
      <br />
    </Fragment>
  )
}

const BackupView = () => {
  const [backups, setBackups] = useState(null);
  const [error, setError] = useState(null);
  const [key, setKey] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const temp_backups = await getBackups();
      if (!temp_backups) {
        throw 'Server Disconnected: Null Back ups'
      }
      setBackups(temp_backups);
    };
    fetchData().catch(e => setError(e))
  }, [key]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (backups === null) {
    return <BackupHeader key={key} setKey={setKey} />
  }
  return (
    <Fragment>
      <BackupHeader setKey={setKey}/>
      <BackupList key={key} events={backups} />
    </Fragment>
  );
}

export default BackupView;
