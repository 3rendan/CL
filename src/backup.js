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

const LaunchModal = (props) => {
  const backup = props.backup;
  const header = <h1> {props.type} Backup </h1>;
  const variant = props.type === 'Delete' ? 'danger' : 'success';

  return (
    <Jumbotron>
      {header}
      <p>
        {moment(backup.date).format('LLL')}
      </p>
      <p>
        <Button variant={variant} onClick={props.onClick}>{props.type}</Button>
      </p>
    </Jumbotron>
  );
}

const BackupItem = (props) => {
  const backup = props.backup;
  const [modal, setModal] = useState(null);
  const [show, setShow] = useState(true)

  useEffect(() => {
  }, [modal, show])

  if (!show) {
    return null;
  }
  return (
    <Fragment>
      <ListGroup.Item key={backup.id}>
        {moment(backup.date).format('LLL')}
        <button type="button" style = {{marginLeft: "25px"}} onClick={(e) =>   {
            if (modal !== null && modal.props.type === 'Restore') {
              setModal(null);
            }
            else {
              setModal(<LaunchModal type='Restore' backup={backup}
                      onClick={() => {
                        restore(backup.id)
                      }}/>)

              console.log('restore ' + backup.id)
            }

          }
          }
        className="btn btn-success btn-lg">Restore Backup</button>
        <button type="button" style = {{marginLeft: "25px"}} onClick={() =>
          {
            if (modal !== null && modal.props.type === 'Delete') {
              setModal(null);
            }
            else {
              setModal(<LaunchModal type='Delete' backup={backup}
                      onClick={() => {
                        setShow(false);
                        deleteBackup(backup.id)
                        // CALL DELETE HERE
                      }}/>)
            }
          }
          }
        className="btn btn-danger btn-lg">Delete Backup</button>
      </ListGroup.Item>
      {modal}
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
