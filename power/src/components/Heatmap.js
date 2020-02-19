import React, { useState, useEffect } from 'react';

export default function Heatmap(){
  const [dateStart, setdateStart] = useState('2020-01-01');
  const [dateEnd, setdateEnd] = useState('2020-02-17');
  const [data, setData] = useState([]);

  useEffect(() => {
    const timeStart = new Date(`${dateStart} 00:00:00.000`).getTime();
    const timeEnd = new Date(`${dateEnd} 23:59:59.999`).getTime();
    const getHourly = async () => {
      const response = await fetch(`https://power.labitat.dk/hourly/${timeStart}/${timeEnd}`);
      response.status === 200 && setData(await response.json());
    };
    getHourly();
  }, [dateStart, dateEnd]);
  
  const dataEnriched = data.map(d => {
    const timestamp = new Date(d[0]);
    return { 
      timeslot: timestamp.getHours(),
      day: (timestamp.getDay() - 1) % 7, // moving Sunday to end of week instead of start of week
      powerConsumption: d[2],
      longestBlipGap: d[4],
      shortestBlipGap: d[3],
      timestamp,
      blipsCount: d[1]
    }
  });

  const rows = [];
  for (let timeslot = 0; timeslot < 24; timeslot++){
    const days = [];
    for (let day = 0; day < 7; day++){
      const dataPoints = dataEnriched.filter(d => d.timeslot === timeslot && d.day === day);
      const powerConsumption = dataPoints.reduce((avg, value, _, { length }) => avg + value.powerConsumption / length, 0);
      days.push(dataPoints.length > 0 ? 
        <td style={{
          color: powerConsumption < 1000 ? 'lightgrey' : 'black', 
          backgroundColor: `rgb(${powerConsumption / 1500 * 256}, 0, 0)`,
          textAlign: 'center'
        }}>{powerConsumption.toFixed()}</td> :
        <td></td>
      )
    }
    rows.push(
      <tr>
        <td style={{ textAlign: 'center' }}>{timeslot}:00 - {timeslot+1}:00</td>
        {days}
      </tr>
    )
  }
  
  return (
    <div>
      <form>
        <label htmlFor="start">Start date</label>
        <input id='start' type="date" value={dateStart} onChange={e => setdateStart(e.target.value)} />
        <label htmlFor="end">End date</label>
        <input id='end' type="date" value={dateEnd} onChange={e => setdateEnd(e.target.value)} />
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