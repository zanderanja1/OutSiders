import React, { useState, useEffect } from 'react';

function CreateAttraction() {
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [attraction, setAttraction] = useState({
    name: '',
    region: '',
    city: '',
    district: '',
    coordinates: ['', ''],
    otherDistrict: ''
  });

  useEffect(() => {
    // Fetch regions
    const fetchRegions = async () => {
      try {
        const res = await fetch('http://localhost:3001/region');
        const data = await res.json();
        setRegions(data);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };

    fetchRegions();
  }, []);

  const fetchCities = async (region) => {
    try {
      const res = await fetch(`http://localhost:3001/city/region/${region}`);
      const data = await res.json();

      const formattedData = data.map((city) => ({
        _id: city._id,
        name: city.name,
        regionId: city.regionId,
        region: city.region
      }));
      setCities(formattedData);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  const fetchDistricts = async (city) => {
    try {
      const res = await fetch(`http://localhost:3001/district/city/${city}`);
      const data = await res.json();
      const formattedData = data.map((district) => ({
        _id: district._id,
        name: district.name,
        cityId: district.city._id,
        city: district.city.name
      }));
      setDistricts(formattedData);
    } catch (error) {
      console.error('Error fetching districts:', error);
    }
  };

  const handleRegionChange = (e) => {
    const selectedRegion = e.target.value;
    setAttraction({ ...attraction, region: selectedRegion });
    fetchCities(selectedRegion);
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setAttraction({ ...attraction, city: selectedCity });
    fetchDistricts(selectedCity);
  };

  const handleDistrictChange = (e) => {
    const selectedDistrict = e.target.value;
    setAttraction({ ...attraction, district: selectedDistrict });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAttraction({ ...attraction, [name]: value });
  };

  const handleCoordinateChange = (e, index) => {
    const updatedCoordinates = [...attraction.coordinates];
    updatedCoordinates[index] = e.target.value;
    setAttraction({ ...attraction, coordinates: updatedCoordinates });
  };

  const handleCreateAttraction = async (e) => {
    e.preventDefault();

    try {
      // Create region if a new one is selected
      let regionId = null;
      if (!regions.find((reg) => reg.name === attraction.region)) {
        const regionResponse = await fetch('http://localhost:3001/region', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: attraction.region
          })
        });
        const regionData = await regionResponse.json();
        regionId = regionData.id;
      } else {
        regionId = regions.find((reg) => reg.name === attraction.region)._id;
      }

      // Create city if a new one is selected
      let cityId = null;
      if (!cities.find((cty) => cty.name === attraction.city)) {
        const cityResponse = await fetch('http://localhost:3001/city', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: attraction.city,
            regionId: regionId
          })
        });
        const cityData = await cityResponse.json();
        cityId = cityData.id;
      } else {
        cityId = cities.find((cty) => cty.name === attraction.city)._id;
      }

      // Create district if a new one is selected
      let districtId = null;
      if (attraction.district === 'other') {
        const districtResponse = await fetch('http://localhost:3001/district', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: attraction.otherDistrict,
            cityId: cityId
          })
        });
        const districtData = await districtResponse.json();
        districtId = districtData._id;
      } else {
        districtId = districts.find((dist) => dist.name === attraction.district)._id;
      }

      // Create attraction
      const attractionResponse = await fetch('http://localhost:3001/attraction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: attraction.name,
          districtId: districtId,
          coordinates: attraction.coordinates
        })
      });

      console.log('Attraction created:', attractionResponse);

      // Reset form
      setAttraction({
        name: '',
        region: '',
        city: '',
        district: '',
        coordinates: ['', ''],
        otherDistrict: ''
      });
    } catch (error) {
      console.error('Error creating attraction:', error);
    }
  };

  return (
    <div>
      <h3>Create Attraction:</h3>
      <form onSubmit={handleCreateAttraction}>
        <div>
          <label>Region:</label>
          <select value={attraction.region} onChange={handleRegionChange}>
            <option value="">Select Region</option>
            {regions.map((region) => (
              <option key={region._id} value={region.name}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>City:</label>
          <select value={attraction.city} onChange={handleCityChange} disabled={!attraction.region}>
            <option value="">Select City</option>
            {cities.map((city) => (
              <option key={city._id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>District:</label>
          {attraction.city && (
            <select value={attraction.district} onChange={handleDistrictChange}>
              <option value="">Select District</option>
              {districts.map((district) => (
                <option key={district._id} value={district.name}>
                  {district.name}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
          )}
          {attraction.district === 'other' && (
            <div>
              <label>Other District:</label>
              <input
                type="text"
                name="otherDistrict"
                value={attraction.otherDistrict}
                onChange={handleInputChange}
              />
            </div>
          )}
        </div>
        <div>
          <label>Attraction Name:</label>
          <input
            type="text"
            name="name"
            value={attraction.name}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Latitude:</label>
          <input
            type="text"
            value={attraction.coordinates[0]}
            onChange={(e) => handleCoordinateChange(e, 0)}
          />
        </div>
        <div>
          <label>Longitude:</label>
          <input
            type="text"
            value={attraction.coordinates[1]}
            onChange={(e) => handleCoordinateChange(e, 1)}
          />
        </div>
        <button type="submit">Create Attraction</button>
      </form>
    </div>
  );
}

export default CreateAttraction;
