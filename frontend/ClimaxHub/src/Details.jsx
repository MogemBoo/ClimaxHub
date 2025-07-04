import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import './Details.css';

const Details = () => {
  const { id } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [type, setType] = useState('movie');

  useEffect(() => {
    const isSeries = location.pathname.includes('/series/');
    setType(isSeries ? 'series' : 'movie');

    fetch(`http://localhost:5000/api/${isSeries ? 'series' : 'movies'}/${id}`)
      .then(res => res.json())
      .then(setData)
      .catch(() => { });
  }, [id, location]);

  if (!data) return <div className="loader">Loading...</div>;

  return (
    <div className="fullscreen-wrapper">
      <div className="background-blur" style={{ backgroundImage: `url(${data.poster_url})` }}></div>

      <div className="content">
        <img className="poster" src={data.poster_url} alt={data.title} />

        <div className="info">
          <h1>{data.title}</h1>
          <p className="sub">
            {new Date(type === 'movie' ? data.release_date : data.start_date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {data.duration ? ` • ${data.duration} min` : ''}
            {data.rating ? ` • ⭐ ${data.rating}` : ''}
          </p>
          <p className="desc">{data.description}</p>

          <div className="tags">
            {(data.genres || []).map((g, i) => (
              <span className="tag" key={i}>{g}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="extras">
        {/* Cast Section */}
        <h2 className="section-title">{type} Cast</h2>
        <div className="people-grid">
          {(data.cast || []).map(person => (
            <div className="person-card" key={person.person_id}>
              <img
                src={person.profile_img_url || '/fallback.jpg'}
                onError={(e) => { e.target.src = '/fallback.jpg'; }}
                alt={person.name}
              />
              <h4>{person.name}</h4>
              <p className="role">{person.character_name}</p>
            </div>
          ))}
        </div>

        {/* Crew Section */}
        <h2 className="section-title">{type} Crew</h2>
        <div className="people-grid">
          {(data.crew || []).map(person => (
            <div className="person-card" key={person.person_id}>
              <img
                src={person.profile_img_url || '/fallback.jpg'}
                onError={(e) => { e.target.src = '/fallback.jpg'; }}
                alt={person.name}
              />
              <h4>{person.name}</h4>
              <p className="role">{person.role}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Details;
