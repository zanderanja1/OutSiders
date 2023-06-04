import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import Photo from './Photo';
import PhotoDetails from './PhotoDetails';

function Photos() {
  const [photos, setPhotos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getPhotos = async () => {
        const options = {
            root: null, 
            rootMargin: '0px', 
            threshold: 0.5,
        };
      try {
        const res = await fetch("http://localhost:3001/photos");
        const data = await res.json();
        setPhotos(data);
      } catch (error) {
        console.error('Error fetching photos:', error);
      }
      
    };

    getPhotos();
  }, []);


  return (
    <div>
      <h3>Photos:</h3>
      <ul  >
        {photos.map((photo) => (
          <Photo
            photo={photo}
            key={photo._id}
          />
        ))}
      </ul>
    </div>
  );
}

export default Photos;
