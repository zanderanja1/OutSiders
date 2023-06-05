import React, { useState, useEffect } from 'react';
import { Bar, Pie, Scatter } from 'react-chartjs-2';
import Chart from 'chart.js/auto';


function App() {
  const [graphType, setGraphType] = useState('bar');
  const [attractionsData, setAttractionsData] = useState([]);

  useEffect(() => {
    fetchAttractionData();
  }, []);

  async function fetchAttractionData() {
    try {
      const [regions, cities, districts, attractions] = await Promise.all([
        fetch('http://localhost:3001/region/').then((res) => res.json()),
        fetch('http://localhost:3001/city/').then((res) => res.json()),
        fetch('http://localhost:3001/district/').then((res) => res.json()),
        fetch('http://localhost:3001/attraction/list').then((res) => res.json())
      ]);

      // Process the data and set it to the state
      const processedData = processAttractionsData(attractions, districts, cities, regions);
      setAttractionsData(processedData);
    } catch (error) {
      console.error('Error fetching attraction data:', error);
    }
  }

  function processAttractionsData(attractions, districts, cities, regions) {
    // Process the data here based on your requirements
    // Return the processed data in a suitable format for the chosen graph type

    if (graphType === 'scatter') {
      const scatterData = attractions.map((attraction) => {
        const district = districts.find((dist) => dist.name === attraction.district.name);
        const city = cities.find((cty) => cty._id === district.cityId);
        const region = regions.find((reg) => reg._id === city.regionId);

        return {
          x: attraction.coordinates[0],
          y: attraction.coordinates[1],
          region: region.name,
          attraction: attraction.name
        };
      });

      return scatterData;
    } else {
      const regionCount = attractions.reduce((count, attraction) => {
        const district = districts.find((dist) => dist.name === attraction.district.name);
        const city = cities.find((cty) => cty._id === district.cityId);
        const region = regions.find((reg) => reg._id === city.regionId);
        const regionName = region.name;

        count[regionName] = (count[regionName] || 0) + 1;
        return count;
      }, {});

      const labels = Object.keys(regionCount);
      const counts = Object.values(regionCount);

      return {
        labels,
        counts
      };
    }
  }

  function renderGraph() {
    if (graphType === 'bar') {
      const chartData = {
        labels: attractionsData.labels,
        datasets: [
          {
            label: 'Attractions by Region',
            data: attractionsData.counts,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };

      return (
        <div>
          <h2>Attractions by Region (Bar Chart)</h2>
          <Bar data={chartData} />
        </div>
      );
    } else if (graphType === 'pie') {
      const chartData = {
        labels: attractionsData.labels,
        datasets: [
          {
            data: attractionsData.counts,
            backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)'],
            borderColor: ['rgba(75, 192, 192, 1)', 'rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)'],
            borderWidth: 1
          }
        ]
      };

      return (
        <div>
          <h2>Attractions by Region (Pie Chart)</h2>
          <Pie data={chartData} />
        </div>
      );
    } else if (graphType === 'scatter') {
      const scatterData = {
        datasets: [
          {
            label: 'Attractions by Location',
            data: attractionsData,
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      };

      return (
        <div>
          <h2>Attractions by Location (Scatter Plot)</h2>
          <Scatter data={scatterData} />
        </div>
      );
    }

    return null;
  }

  return (
    <div>
      <h1>My App</h1>
      <select value={graphType} onChange={(e) => setGraphType(e.target.value)}>
        <option value="bar">Bar Chart</option>
        <option value="pie">Pie Chart</option>
        <option value="scatter">Scatter Plot</option>
      </select>
      {renderGraph()}
    </div>
  );
}

export default App;
