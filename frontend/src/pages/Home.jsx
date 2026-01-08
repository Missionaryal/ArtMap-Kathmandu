import { useEffect, useState } from "react";

function Home() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/places/")
      .then((res) => res.json())
      .then((data) => setPlaces(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Places</h1>
      {places.map((place) => (
        <div key={place.id}>
          <h2>{place.name}</h2>
          <p>{place.description}</p>
          <p>Category: {place.category}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;
