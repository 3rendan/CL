import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

import './mainWindow.css'

import {getInvestments} from './serverAPI/investments'
import {getSingleEntrys} from './serverAPI/singleEntry'
import {getCommissionsInvestment} from './serverAPI/commissions'
import {getDistributionsInvestment} from './serverAPI/distributions'
import {getContributionsInvestment} from './serverAPI/contributions'
import {getTransfers} from './serverAPI/transfers'

import {getNAVEvents, insertSingleEntry, updateSingleEntry, SingleEntry} from './serverAPI/singleEntry'

import {defaultTabulatorSettings, myMoneyFormatter, rightClickMoney, initialMoneyFormatter} from './SpecialColumn';

import moment from 'moment';
import './shrinkFontSize.css';
import "react-tabulator/css/tabulator.min.css"; // use Theme(s)


import { React15Tabulator } from "react-tabulator"; // for React 15.x

window.moment = moment;
const electron = window.require('electron');
const remote = electron.remote;
const dialog = remote.dialog;

function updateRow(cell) {
  async function updateEntry(investment) {
    const navEvent = await getNAVEvents(investment);
    navEvent.filter(event => moment(event.date).format('L') === cell.getField())

    const singleEntryData = {Date: cell.getField(), Notes: "", Amount: cell.getValue(), Type: 'NAV'};
    singleEntryData.Investment = {value: {id: investment}}

    const singleEntry = new SingleEntry(singleEntryData)
    if (navEvent.length === 0) {
      insertSingleEntry(singleEntry)
    }
    else {
      singleEntry['id'] = navEvent[0].id
      updateSingleEntry(singleEntry)
    }
  }

  if (cell.getValue() === '') {
    return;
  }
  updateEntry(cell.getData()['id'])

}


// table class
const DetailInvestmentTable = (props) => {
  const InvestmentData = props.data;
  const readOnly = props.readOnly;
  const [columns, setColumns] = useState(['Investment']);
  const [tableData, setTableData] = useState(undefined);
  const [date, setDate] = useState(moment(new Date()).format('yyyy-MM-DD'));

  const ref = useRef();

  useEffect(() => {
    async function getNAVData(investmentID) {
      return await getNAVEvents(investmentID);
    }

    async function fetchEventData(investmentID) {
      let singleEntry = await getSingleEntrys(investmentID);
      singleEntry = singleEntry ? singleEntry : [];
      let commission = await getCommissionsInvestment(investmentID);
      commission = commission ? commission : [];
      commission = commission.map((comm) => {
        comm['type'] = 'COMMISH'
        return comm;
      })
      let distribution = await getDistributionsInvestment(investmentID);
      distribution = distribution ? distribution : [];
      distribution = distribution.map((dist) => {
        dist['type'] = 'DISTRIBUTION'
        return dist;
      })

      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      contribution = contribution.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
        return contr;
      })

      let navs = await getNAVEvents(investmentID);
      navs = navs.map((nav) => {
        nav['type'] = 'NAV'
        return nav;
      })

      let transfers = await getTransfers(investmentID);
      transfers = transfers.map((transfer) => {
        transfer['type'] = 'TRANSFER'
        return transfer;
      })

      return [...singleEntry, ...commission,
        ...distribution, ...contribution, ...navs,
        ...transfers];
    }


    async function getData() {
      const investments = await getInvestments();
      const investmentIdToName = {};
      investments.map(investment => {
          investmentIdToName[investment.id] = investment.name;
      })

      const investmentIdToNAVEvents = {};
      await Promise.all(investments.map(async (investment) => {
          investmentIdToNAVEvents[investment.id] = await getNAVData(investment.id);
      }));

      if (date === undefined) {
        return;
      }
      const formattedDate = moment(date).format('L');


      const updateTableData = investments.map(investment => {
        const navsForDate = investmentIdToNAVEvents[investment.id];

        const navList = navsForDate.filter(i => moment(new Date(i.date)).format('L') === formattedDate);
        let nav = undefined;
        if (navList.length > 0) {
          nav = navList[0].amount;
        }


        const tableRow = {id: investment.id, investment: investment.name};
        tableRow[formattedDate] = nav

        return tableRow;
      })
      console.log(updateTableData)
      setTableData(updateTableData);

    }


    if (date !== undefined) {
      const formattedDate = moment(date).format('L');
      setColumns([
        {title: "Investment", field: "investment", responsive: 0},
        {title: formattedDate + ' NAV', field: formattedDate, responsive: 0,
          formatter: initialMoneyFormatter, editor: "number",
          cellEdited:updateRow
        }
      ]);
    }

    getData()
  }, [date])

  const handleChange = (e) => {
    setDate(e.target.value)
  }

  if (!tableData) {
    return (
      <div>
        <div className="w3-show-inline-block" style= {{width: "100%"}}>
            <br />
            <h1 style = {{margin: 0, marginLeft: '40%', display: "inline-block"}}> {'Insert NAV'} </h1>
            <br />
            <br />
        </div>
        <div className="text">
        Date:
        </div>
        <input type="date" onChange={handleChange.bind(this)} defaultValue={date}/>
        <br />
      </div>
    );
  }

  //add table holder element to DOM
  return (
    <div>
      <div className="w3-show-inline-block" style= {{width: "100%"}}>
          <br />
          <h1 style = {{margin: 0, marginLeft: '40%', display: "inline-block"}}> {'Insert NAV'} </h1>
          <br />
          <br />
      </div>
      <div className="text">
      Date:
      </div>
      <input type="date" onBlur={handleChange.bind(this)} defaultValue={date}/>
      <br />
      <br />
      <br />
      <br />
      <React15Tabulator
        ref={ref}
        columns={columns}
        data={tableData}
        options={{...defaultTabulatorSettings,
        initialSort: [{column: "investment", dir:'asc'}]}
        }
        data-custom-attr="test-custom-attribute"
        className="custom-css-class"
      />
      <br />
    </div>
  );
}

export default DetailInvestmentTable;
