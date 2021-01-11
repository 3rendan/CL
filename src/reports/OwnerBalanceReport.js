import React, {Fragment, useState, useEffect} from "react";
import ReactDOM from 'react-dom';
import moment from 'moment';

import {getSingleEntrys, getNAVEvents} from '../serverAPI/singleEntry.js'
import {getDistributionsInvestment} from '../serverAPI/distributions.js'
import {getContributionsInvestment} from '../serverAPI/contributions.js'
import {getCommissionsInvestment} from '../serverAPI/commissions.js'
import {getTransfers} from '../serverAPI/transfers.js'
import {getInvestments} from '../serverAPI/investments'

import {getOwners} from '../serverAPI/owners'

import {calcNAV} from '../SpecialColumn'

import MaintenanceTable from './reportTables'


const OwnerBalanceReport = (props) => {
  const [data, setData] = useState(null);
  const [date, setDate] = useState(moment(new Date()).format('yyyy-MM-DD'));
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setDate(e.target.value)
  }

  useEffect(() => {
    async function fetchData(investmentID) {
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
        dist['type'] = 'DISTRIBUTION';
        dist['date_sent'] = dist['contra_date'];
        dist['to_investment'] = dist.contra_investment;
        dist['from_investment'] = dist.fund_investment;
        return dist;
      })

      let contribution = await getContributionsInvestment(investmentID);
      contribution = contribution ? contribution : [];
      contribution = contribution.map((contr) => {
        contr['type'] = 'CONTRIBUTION'
        contr['date_sent'] = contr['contra_date'];
        contr['to_investment'] = contr.contra_investment;
        contr['from_investment'] = contr.fund_investment;
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

    async function getOwnerIdToName() {
      const owners = await getOwners();
      const ownerIdToName = {};
      owners.map(owner => {
        ownerIdToName[owner.id] = owner.name;
      })
      return ownerIdToName;
    }

    async function manipulateData() {
      const [investments, ownerIdToName] = await Promise.all([getInvestments(), getOwnerIdToName()]);

      const owners = {}
      await Promise.all(investments.map(async (investment) => {
        const data = await fetchData(investment.id);
        const midnightEndOfDate = new Date(date).setHours(24,0,0,0);
        const dataBeforeDate = data.filter(i => new Date(i.date ? i.date : i.date_due) <= midnightEndOfDate);
        const nav = calcNAV(dataBeforeDate, investment.id, 0, investment.invest_type);
        console.log(investment.id)
        console.log(investment)
        const owner = ownerIdToName[investment.owner];
        if (owner in owners) {
          owners[owner] += nav;
        }
        else {
          owners[owner] = nav;
        }
      }));
      const allOwners = Object.keys(owners);
      let totalNAV = allOwners.reduce((a,b) => a+owners[b], 0);
      const ownerData = allOwners.map((owner) => {
        return {owner: owner, nav: owners[owner],
                'nav_(%)': (owners[owner]/totalNAV * 100).toFixed(2) + '%'}
      })
      ownerData.push({owner: 'Total NAV', nav: totalNAV, 'nav_(%)': '100.00%'})
      setData(ownerData);
    }
    manipulateData().catch(e => setError(e))

  }, [date]);

  if (error) {
    return (<Fragment> <h1> Error!! Server Likely Disconnected </h1> <div> {error.toString()} </div> </Fragment>)
  }
  if (data === null) {
    return <div> </div>;
  }
  return (
    <Fragment>
      <br />
      <h1 className="text">
      Date:
      </h1>
      <input type="date" onChange={handleChange.bind(this)} defaultValue={date} />
      <br />
      <br />
      <MaintenanceTable name={"Owner NAV"} data={data}
            columns={['Owner', 'NAV', 'NAV (%)']}
            moneyColumns={['NAV', 'NAV (%)']}
            noButton={true}/>
    </Fragment>
  );
}

export default OwnerBalanceReport;
