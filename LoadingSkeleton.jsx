const LoadingSkeleton = ({ type }) => {
  if (type === 'carousel') {
    return (
      <div className="carousel-skeleton">
        {[...Array(5)].map((_, i) => <div key={i} className="skeleton-card"></div>)}
      </div>
    );
  }
  return <div className="skeleton"></div>;
};

export default LoadingSkeleton;