import React, { useState, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';

import moment from 'moment';

import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'
import Jumbotron from 'react-bootstrap/Jumbotron'

import {Backup, getBackups, insertBackup,
  deleteBackup, restore} from './serverAPI/backups.js'


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
          const confirmed = window.confirm('Confirm Restore?')
          if (!confirmed) {
            return
          }
          restore(backup.id)

          }
          }
        className="btn btn-success btn-lg">Restore Backup</button>
        <button type="button" style = {{marginLeft: "25px"}} onClick={() => {
          const confirmed = window.confirm('Confirm Delete?')
          if (!confirmed) {
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
      <h1> Backups - Click to Restore </h1>
      <Button variant="success" size="lg" onClick={() => createBackup(props.setKey)}> Backup </Button>
      <br />
      <br />
    </Fragment>
  )
}

const BackupView = () => {
  const [backups, setBackups] = useState(null);
  const [key, setKey] = useState(0)

  useEffect(() => {
    async function fetchData() {
      const temp_backups = await getBackups();
      setBackups(temp_backups);
    };
    fetchData();
  }, [key]);

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
