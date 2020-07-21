import React, { useState, useEffect, Fragment } from 'react';
import ReactDOM from 'react-dom';

import moment from 'moment';

import Button from 'react-bootstrap/Button'
import ListGroup from 'react-bootstrap/ListGroup'

import {Backup, getBackups, insertBackup, restore} from './serverAPI/backups.js'

const click = (backup, e) => {
  restore(backup.id)
  console.log(backup.id)
}

const createBackup = (setKey) => {
  const backup = new Backup();
  async function insertAndFetch() {
    await insertBackup(backup);
    setKey(key => key+1)
  };
  insertAndFetch();


}

const BackupList = (props) => {
  const backups = props.events;
  const backupItems = backups.map(backup =>
    <ListGroup.Item key={backup.id}>
      {moment(backup.date).format('LLL')}
      <button type="button" style = {{marginLeft: "25px"}} onClick={(e) => click(backup, e)}
      className="btn btn-success btn-lg">Restore Backup</button>
      <button type="button" style = {{marginLeft: "25px"}} onClick={() =>
        {
          console.log('delete ' + backup.id)
        }
        }
      className="btn btn-danger btn-lg">Delete Backup</button>
    </ListGroup.Item>
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
