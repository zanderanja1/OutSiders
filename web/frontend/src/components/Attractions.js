import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Attractions() {
  const [attractions, setAttractions] = useState([]);
  const [attractions2, setAttractions2] = useState([]);
  const [oldValues, setOldValues] = useState([]);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:3001/attraction');
        const data = await res.json();

        // Fetch districts
        const districtNames = [...new Set(data.map((attraction) => attraction.district.name))];
        const districtPromises = districtNames.map(async (districtName) => {
          const res = await fetch('http://localhost:3001/district/' + districtName);
          return res.json();
        });
        const districtResponses = await Promise.all(districtPromises);
        const fetchedDistricts = districtResponses.reduce((acc, response) => [...acc, ...response], []);
        setDistricts(fetchedDistricts);

        // Fetch cities
        const cityNames = [...new Set(fetchedDistricts.map((district) => district.city.name))];
        const cityPromises = cityNames.map(async (cityName) => {
          const res = await fetch('http://localhost:3001/city/' + cityName);
          return res.json();
        });
        const cityResponses = await Promise.all(cityPromises);
        const cities = cityResponses.reduce((acc, response) => [...acc, ...response], []);

        // Combine data and set states
        const combinedData = data.map((attraction) => {
          const district = fetchedDistricts.find((district) => district.name === attraction.district.name);
          const city = cities.find((city) => city.name === district.city.name);
          return { ...attraction, district, city, isEditing: false };
        });

        setAttractions(combinedData);
        setAttractions2(combinedData);
        const oldValues1 = combinedData.map((attraction) => ({ ...attraction }));
        setOldValues(oldValues1);
      } catch (error) {
        console.error('Error fetching attractions:', error);
      }
    };

    fetchData();
  }, []);

  const handleEditClick = (index) => {
    const updatedAttractions = [...attractions];
    updatedAttractions[index].isEditing = true;
    setAttractions(updatedAttractions);
  };

  const handleInputChange = (index, field, value) => {
    const updatedAttractions = attractions.map((attraction, i) => {
      if (i === index) {
        if (field === 'district') {
          const updatedDistrict = { ...attraction.district, name: value };
          return { ...attraction, district: updatedDistrict };
        } else if (field === 'city') {
          const updatedCity = { ...attraction.city, name: value };
          return { ...attraction, city: updatedCity };
        } else {
          return { ...attraction, [field]: value };
        }
      }
      return attraction;
    });
  
    setAttractions(updatedAttractions);
  };
  
  
  

  const saveOldValues = () => {
    setOldValues(attractions.map((attraction) => ({ ...attraction })));
  };

  const updateAttraction = async (index) => {
    const attraction = attractions[index];
    const { _id, name: oldName, district, city, coordinates } = attraction;
    const { name: newName } = attractions2[index];

    try {
      const updatePromises = [];
      console.log(newName + ' | ' + oldName);

      // Update district if changed
      console.log(district.name + '||' + oldValues[index]?.district?.name);
      if (district !== oldValues[index]?.district?.name) {
        updatePromises.push(
          fetch(`http://localhost:3001/district/update/`+oldValues[index]?.district?._id, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: district.name
            }),
          })
        );
      }

      // Update city if changed
      console.log(city.name+ '||' + oldValues[index]?.city?.name);
      if (city.name !== oldValues[index]?.city?.name) {
        updatePromises.push(
          fetch(`http://localhost:3001/city/update/`+oldValues[index]?.city?._id, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: city.name ,
            }),
          })
        );
      }

      // Update coordinates if changed
      if (newName !== oldName) {
        updatePromises.push(
          fetch(`http://localhost:3001/attraction/update/${_id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: oldName,
              coordinates: coordinates,
            }),
          })
        );
      }

      // Wait for all update requests to complete
      const updateResponses = await Promise.all(updatePromises);

      // Check if all updates were successful
      const allUpdatesSuccessful = updateResponses.every((res) => res.ok);

      if (allUpdatesSuccessful) {
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
              <button onClick={() => updateAttraction(index)}>Update</button>
            </div>
          ) : (
            <div>
              <p>
                {attraction.name}, {attraction.district?.name}, {attraction.city?.name}:{' '}
                {attraction.coordinates[0]}, {attraction.coordinates[1]}
              </p>
              <button onClick={() => handleEditClick(index)} onMouseDown={saveOldValues}>
                Edit
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Attractions;
