import React, { useState, useEffect } from 'react';

export default function Heatmap(){
  const [dateStart, setdateStart] = useState('2020-01-01');
  const [dateEnd, setdateEnd] = useState(new Date().toISOString().substring(0, 10));
  const [threshold, setThreshold] = useState(1500);
  const [data, setData] = useState([]);
  

  useEffect(() => {
    const timeStart = new Date(`${dateStart} 00:00:00.000`).getTime();
    const timeEnd = new Date(`${dateEnd} 23:59:59.999`).getTime();
    const getHourly = async () => {
      const response = await fetch(`https://power.labitat.dk/hourly/${timeStart}/${timeEnd}`);
      response.status === 200 && setData(await response.json());
    };
    timeStart && timeEnd && getHourly(); // only fetch data if timeStart and timeEnd are proper integers
  }, [dateStart, dateEnd]);
  
  const dataEnriched = data.map(d => {
    const timestamp = new Date(d[0]);
    return { 
      timeslot: timestamp.getHours(),
      day: (timestamp.getDay() + 6) % 7, // moving Sunday to end of week instead of start of week
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
        <td key={day} style={{
          color: powerConsumption < threshold / 3 * 2 ? 'lightgrey' : 'black', 
          backgroundColor: `rgb(${powerConsumption / threshold * 256}, 0, 0)`,
          textAlign: 'center'
        }}>{powerConsumption.toFixed()}</td> :
        <td key={day}></td>
      )
    }
    rows.push(
      <tr key={timeslot}>
        <td style={{ textAlign: 'center' }}>{timeslot}:00 - {timeslot+1}:00</td>
        {days}
      </tr>
    )
  }
  
  return (
    <div className="jumbotron">
      <div style={{ maxWidth: "600px" }}>
        <h3>Average power usage during the week</h3>
        <p>The table shows the average power usage in watts across the 24 times 7 hourly timeslots any week contains.</p>
        <p>The averages are calculated across the given range with both days included.</p>
        <form style={{ maxWidth: "350px" }}>
          <fieldset>
            <div className="form-group">
              <label htmlFor="range">Range</label>
              <div id="range" style={{ display: "flex", flex: 1, flexDirection: "row", justifyContent: "space-between" }}>
                <input id='start' type="date" className="form-control" style={{ width: "170px" }} value={dateStart} onChange={e => setdateStart(e.target.value)} />  
                <input id='end' type="date" className="form-control" style={{ width: "170px" }} value={dateEnd} onChange={e => setdateEnd(e.target.value)} />
              </div>
            </div>
          </fieldset>
        </form>
        <p>The color is currently saturated at {threshold} W.</p>
        <form style={{ maxWidth: "250px" }}>
          <fieldset className="form-group">
            <label htmlFor="threshold">Saturation threshold</label>
            <input id='threshold' className="custom-range" type="range" min="0" max="5000" step="100" value={threshold} onChange={e => setThreshold(e.target.value)} />
          </fieldset>
        </form>
      </div>
      <table style={{ width: "100%", textAlign: "center" }}>
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