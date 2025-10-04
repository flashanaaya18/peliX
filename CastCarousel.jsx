const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w200';

const CastCarousel = ({ cast }) => {
  return (
    <div className="cast-carousel-container">
      <h3 className="titulo-seccion">Reparto Principal</h3>
      <div className="cast-carousel">
        {cast.slice(0, 10).map(member => (
          <div key={member.cast_id} className="cast-card">
            <img 
              src={member.profile_path ? `${IMG_BASE_URL}${member.profile_path}` : '/src/assets/default-avatar.png'} 
              alt={member.name} 
            />
            <p className="cast-name">{member.name}</p>
            <p className="cast-character">{member.character}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CastCarousel;