import { useState, useEffect, useMemo, useRef } from 'react';
import PhotoDetails from './PhotoDetails';


function useOnScreen(ref) {
  const [isIntersecting, setIntersecting] = useState(false);

  const observer = useMemo(
    () =>
      new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting)),
    []
  );

  useEffect(() => {
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [observer, ref]);

  return isIntersecting;
}

  function Photo(props ) {
    const ref = useRef(null);
    const isVisible = useOnScreen(ref);
    const [viewCountUpdated, setViewCountUpdated] = useState(false);

    useEffect(() => {
      if (isVisible && !viewCountUpdated) {
          const res = fetch("http://localhost:3001/photos/updateViews/" + props.photo._id);
          console.log("+1 view " + props.photo._id);
          setViewCountUpdated(true);
      }
    }, [isVisible, viewCountUpdated]);
    return (
      <div className="card bg-dark text-dark mb-2 w-50">
        <a style={{ zIndex: 100000 }} href={`http://localhost:3000/photo/${props.photo._id}`}>
        <img
          ref={ref}
          className="card-img"
          src={`http://localhost:3001/${props.photo.path}`}
          height="500px"
          width="500px"
          alt={props.photo.name}
          
          
        />
        </a>
        <h3>{props.photo.name}</h3>
        <p>{props.photo._id}</p>
        <div className="card-img-overlay">
          <h5 className="card-title">{props.photo.name}</h5>
        </div>
        <p>Views: {props.photo.views + 1} </p>
        <p>{isVisible && `Yep, I'm on screen`}</p>
         
      </div>
    );
  }

export default Photo;
