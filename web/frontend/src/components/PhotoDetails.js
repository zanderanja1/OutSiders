import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CommentForm from './CommentForm';
import Comments from './Comments';

function PhotoDetails() {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPhotoDetails = async () => {
      try {
        const res = await fetch(`http://localhost:3001/photos/${id}`);
        const data = await res.json();
        setPhoto(data);
      } catch (error) {
        console.error('Error fetching photo details:', error);
      }
    };

    const getComments = async () => {
      try {
        const res = await fetch(`http://localhost:3001/comments/showAll/${id}`);
        const data = await res.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    
    fetchPhotoDetails();
    getComments();
  }, [id]);

  const handleLikeClick = async () => {
    try {
      const response = await fetch(`http://localhost:3001/photos/like/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json'}
      });

      if (response.ok) {
        const data = await response.json();
        setPhoto(data);
      } else {
        console.error('Error liking photo');
      }
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };
  const handleDisLikeClick = async () => {
    try {
      const response = await fetch(`http://localhost:3001/photos/dislike/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json'}
      });

      if (response.ok) {
        const data = await response.json();
        setPhoto(data);
      } else {
        console.error('Error liking photo');
      }
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };



  if (!photo) {
    return <div>Slika ne obstaja</div>;
  }

  return (
    <div>
      <h2>Photo Details</h2>
      <p>Name: {photo.name}</p>
      <img src={`http://localhost:3001${photo.path}`} height="500px" alt={photo.name} />
      <p>Posted By: {photo.postedBy.username}</p>
      <p>Views: {photo.views}</p>
      <p>Likes: {photo.likes.length - photo.dislikes.length}</p>
      
      <button onClick={handleLikeClick}>Like</button>
      <button onClick={handleDisLikeClick}>Dislike</button>
      <CommentForm photo={photo} />
      <Comments comments={comments} />
    </div>
  );
}

export default PhotoDetails;
