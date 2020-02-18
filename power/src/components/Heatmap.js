import React, { useState, useEffect } from 'react';

const timeStart = new Date('2020-02-01 00:00:00').getTime();
const timeEnd = new Date('2020-02-16 23:59:59').getTime();

export default function Heatmap(){
  const [data, setData] = useState([]);
  useEffect(() => {
    const getHourly = async () => {
      const response = await fetch(`https://power.labitat.dk/hourly/${timeStart}/${timeEnd}`);
      response.status === 200 && setData(await response.json());
    };
    getHourly();
  }, []);
  
  const dataEnriched = data.map(d => {
    const timestamp = new Date(d[0]);
    return { 
      timeslot: timestamp.getHours(),
      day: timestamp.getDay(),
      powerConsumption: d[2],
      longestBlipGap: d[4],
      shortestBlipGap: d[3],
      timestamp,
      blipsCount: d[1]
    }
  });
/*
  const dataGrouped = dataEnriched.reduce((acc, obj) => {
    let key = obj.day * 24 + obj.timeslot;
    if(!acc[key]){
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc
  }, new Array(24 * 7));
*/
  const dataGrouped = dataEnriched.reduce((acc, obj) => {
    let key1 = obj.timeslot
    let key2 = obj.day;
    if(!acc[key1]){
      acc[key1] = [];
    }
    if(!acc[key1][key2]){
      acc[key1][key2] = [];
    }
    acc[key1][key2].push(obj);
    return acc
  }, []);

  const pivot = dataGrouped.map(d => d.map(d => d.reduce((avg, value, _, { length }) => avg + value.powerConsumption / length, 0)));
  
  const rows = pivot.map((d, i) => {
    return (
      <tr>
        <th>{i}</th>
        {d.map((t, j) => <td>{t.toFixed()}</td>)}
      </tr>
    )
  });

  return (
    <div>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Time</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
            <th>Sun</th>
          </tr>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    </div>
  )
}