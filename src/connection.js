import React, {Fragment, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

import initializeDatabase from './serverAPI/databaseInitialize'


const electron = window.require('electron');
const remote = electron.remote;
const ipcRenderer  = electron.ipcRenderer;

const Connection = (props) => {
  const onSubmit = (e) => {
    const ipAddress = e.target.elements.formBasicIP.value
    const username  = e.target.elements.formBasicUsername.value
    const password =  e.target.elements.formBasicPassword.value

    const database = {ip: ipAddress, username: username, password: password}
    initializeDatabase(database)

    ipcRenderer.send('setDatabase', database)

    e.preventDefault();
    e.stopPropagation();

  }

  return (
    <Modal.Dialog>
      <Modal.Header closeButton>
        <Modal.Title>Connect to Database</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={onSubmit}>
          <Form.Group controlId="formBasicIP">
            <Form.Label>Database IP Address</Form.Label>
            <Form.Control type="text" placeholder="Enter IP address" />
          </Form.Group>

          <Form.Group controlId="formBasicUsername">
            <Form.Label>Database Username</Form.Label>
            <Form.Control type="text" placeholder="Enter username" />
          </Form.Group>

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Database Password</Form.Label>
            <Form.Control type="password" placeholder="Password" />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Modal.Body>

    </Modal.Dialog>
  )
}

export default Connection;
