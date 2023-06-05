import React, { useState, useEffect } from 'react';
import { Bar, Pie, Scatter } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Dropdown, Card } from 'react-bootstrap';

function App() {
  const [graphType, setGraphType] = useState('bar');
  const [attractionsData, setAttractionsData] = useState([]);

  useEffect(() => {
    fetchAttractionData();
  }, [graphType]);

  async function fetchAttractionData() {
    try {
      const [regions, cities, districts, attractions] = await Promise.all([
        fetch('http://localhost:3001/region/').then((res) => res.json()),
        fetch('http://localhost:3001/city/').then((res) => res.json()),
        fetch('http://localhost:3001/district/').then((res) => res.json()),
        fetch('http://localhost:3001/attraction/list').then((res) => res.json())
      ]);

      const processedData = processAttractionsData(attractions, districts, cities, regions);
      setAttractionsData(processedData);
    } catch (error) {
      console.error('Error fetching attraction data:', error);
    }
  }

  function processAttractionsData(attractions, districts, cities, regions) {
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
    const chartOptions = {
        maintainAspectRatio: false
    };

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
        <div style={{ height: "70vh", width: "80vw", display: 'flex', justifyContent: 'center' }}>
            <Bar data={chartData} options={chartOptions} />
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
        <div style={{ height: "70vh", width: "80vw", display: 'flex', justifyContent: 'center' }}>
            <Pie data={chartData} options={chartOptions} />
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
        <div style={{ height: "70vh", width: "80vw", display: 'flex', justifyContent: 'center' }}>
            <Scatter data={scatterData} options={chartOptions} />
        </div>
      );
    }

    return null;
  }


  return (
    <Container fluid>
      <Row>
        <Col>
          <h1 className="h3 mb-2 text-gray-800">Graphs</h1>
        </Col>
      </Row>
      <Row>
        <Col>
          <Dropdown onSelect={(e) => setGraphType(e)}>
            <Dropdown.Toggle variant="success" id="dropdown-basic">
              {graphType.charAt(0).toUpperCase() + graphType.slice(1)}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item eventKey="bar">Bar Chart</Dropdown.Item>
              <Dropdown.Item eventKey="pie">Pie Chart</Dropdown.Item>
              <Dropdown.Item eventKey="scatter">Scatter Plot</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Row>
        <Col>
          <Card className="shadow mb-4">
            <Card.Header className="py-3">
              <h6 className="m-0 font-weight-bold text-primary">{`Attractions by Region (${graphType.charAt(0).toUpperCase() + graphType.slice(1)} Chart)`}</h6>
            </Card.Header>
            <Card.Body>{renderGraph()}</Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
