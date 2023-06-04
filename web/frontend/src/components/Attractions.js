import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Attractions() {
  const [attractions, setAttractions] = useState([]);

  useEffect(() => {
    const getAttractions = async () => {
      try {
        const res = await fetch('http://localhost:3001/attraction');
        const data = await res.json();
        
        const districtNames = [...new Set(data.map((attraction) => attraction.district.name))];
        const districtPromises = districtNames.map(async (districtName) => {
          const res = await fetch('http://localhost:3001/district/' + districtName);
          return res.json();
        });
        const districtResponses = await Promise.all(districtPromises);
        const districts = districtResponses.reduce((acc, response) => [...acc, ...response], []);

        const cityNames = [...new Set(districts.map((district) => district.city.name))];
        const cityPromises = cityNames.map(async (cityName) => {
          const res = await fetch('http://localhost:3001/city/' + cityName);
          return res.json();
        });
        const cityResponses = await Promise.all(cityPromises);
        const cities = cityResponses.reduce((acc, response) => [...acc, ...response], []);

        const combinedData = data.map((attraction) => {
          const district = districts.find((district) => district.name === attraction.district.name);
          const city = cities.find((city) => city.name === district.city.name);
          return { ...attraction, district, city, isEditing: false };
        });

        setAttractions(combinedData);
      } catch (error) {
        console.error('Error fetching attractions:', error);
      }
    };

    getAttractions();
  }, []);

  const handleEditClick = (index) => {
    const updatedAttractions = [...attractions];
    updatedAttractions[index].isEditing = true;
    setAttractions(updatedAttractions);
  };

  const handleInputChange = (index, field, value) => {
    const updatedAttractions = [...attractions];
    updatedAttractions[index][field] = value;
    setAttractions(updatedAttractions);
  };

  const updateRegion = async (index) => {
    const attraction = attractions[index];
    const { id, district } = attraction;

    try {
      const res = await fetch(`http://localhost:3001/region/update/${district.regionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: district.region.name,
          // other region fields to update
        }),
      });

      if (res.ok) {
        const updatedAttractions = [...attractions];
        updatedAttractions[index].isEditing = false;
        setAttractions(updatedAttractions);
      } else {
        console.error('Error updating region');
      }
    } catch (error) {
      console.error('Error updating region:', error);
    }
  };

  const updateCity = async (index) => {
    const attraction = attractions[index];
    const { id, city } = attraction;

    try {
      const res = await fetch(`http://localhost:3001/city/update/${city.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: city.name,
          // other city fields to update
        }),
      });

      if (res.ok) {
        const updatedAttractions = [...attractions];
        updatedAttractions[index].isEditing = false;
        setAttractions(updatedAttractions);
      } else {
        console.error('Error updating city');
      }
    } catch (error) {
      console.error('Error updating city:', error);
    }
  };

  const updateDistrict = async (index) => {
    const attraction = attractions[index];
    const { id, district } = attraction;

    try {
      const res = await fetch(`http://localhost:3001/district/update/${district.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: district.name,
          // other district fields to update
        }),
      });

      if (res.ok) {
        const updatedAttractions = [...attractions];
        updatedAttractions[index].isEditing = false;
        setAttractions(updatedAttractions);
      } else {
        console.error('Error updating district');
      }
    } catch (error) {
      console.error('Error updating district:', error);
    }
  };

  const updateAttraction = async (index) => {
    const attraction = attractions[index];
    const { id, name, district, city, coordinates } = attraction;

    try {
      console.log(attraction)
      const district_id = district._id
      const res = await fetch(`http://localhost:3001/attraction/update/${attraction._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          district_id,
          coordinates,
        }),
      });

      if (res.ok) {
        const updatedAttractions = [...attractions];
        updatedAttractions[index].isEditing = false;
        setAttractions(updatedAttractions);
      } else {
        console.error('Error updating attraction');
      }
    } catch (error) {
      console.error('Error updating attraction:', error);
    }
  };

  return (
    <div>
      <h3>Attractions:</h3>
      {attractions.map((attraction, index) => (
        <div key={index}>
          {attraction.isEditing ? (
            <div>
              <input
                type="text"
                value={attraction.name}
                onChange={(e) => handleInputChange(index, 'name', e.target.value)}
              />
              <input
                type="text"
                value={attraction.district.name}
                onChange={(e) => handleInputChange(index, 'district', e.target.value)}
              />
              <input
                type="text"
                value={attraction.city.name}
                onChange={(e) => handleInputChange(index, 'city', e.target.value)}
              />
              <input
                type="text"
                value={attraction.coordinates[0]}
                onChange={(e) =>
                  handleInputChange(index, 'coordinates', [e.target.value, attraction.coordinates[1]])
                }
              />
              <input
                type="text"
                value={attraction.coordinates[1]}
                onChange={(e) =>
                  handleInputChange(index, 'coordinates', [attraction.coordinates[0], e.target.value])
                }
              />
              <button onClick={() => updateRegion(index)}>Update Region</button>
              <button onClick={() => updateCity(index)}>Update City</button>
              <button onClick={() => updateDistrict(index)}>Update District</button>
              <button onClick={() => updateAttraction(index)}>Update Attraction</button>
            </div>
          ) : (
            <div>
              <p>
                {attraction.name}, {attraction.district.name}, {attraction.city.name}: {attraction.coordinates[0]},{' '}
                {attraction.coordinates[1]}
              </p>
              <button onClick={() => handleEditClick(index)}>Edit</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Attractions;
