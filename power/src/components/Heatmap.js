import React, { useState, useEffect } from 'react';

export default function Heatmap(){
  const [timeStart, setTimeStart] = useState('2020-01-01');
  const [timeEnd, setTimeEnd] = useState('2020-02-17');
  const [data, setData] = useState([]);

  useEffect(() => {
    const getHourly = async () => {
      const response = await fetch(`https://power.labitat.dk/hourly/${new Date(timeStart).getTime()}/${new Date(timeEnd).getTime()}`);
      response.status === 200 && setData(await response.json());
    };
    getHourly();
  }, [timeStart, timeEnd]);
  
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
        <td style={{ textAlign: 'center' }}>{i}:00-{i+1}:00</td>
        {d.map((t, j) => <td style={{ 
          color: t < 1000 ? 'lightgrey' : 'black', 
          backgroundColor: `rgb(${t/1500 * 256}, 0, 0)`,
          textAlign: 'center'
        }}>{t.toFixed()}</td>)}
      </tr>
    )
  });

  return (
    <div>
      <form>
        <label htmlFor="start">Start date</label>
        <input id='start' type="date" value={timeStart} onChange={e => setTimeStart(e.target.value)} />
        <label htmlFor="end">End date</label>
        <input id='end' type="date" value={timeEnd} onChange={e => setTimeEnd(e.target.value)} />
      </form>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Timeslot</th>
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