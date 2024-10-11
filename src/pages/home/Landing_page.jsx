import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import './landing_page.scss'
const LandingPage = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHotels = async () => {
      const hotelsCollection = collection(db, "hotels");
      const hotelSnapshot = await getDocs(hotelsCollection);
      const hotelList = hotelSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHotels(hotelList);
    };

    fetchHotels();
  }, [db]);

  // Function to handle booking
  const handleBook = (hotelId) => {
    const currentUserId = localStorage.getItem("userId");
    if (currentUserId) {
      navigate(`/booking/${hotelId}`, { state: { userId: currentUserId } });
    } else {
      console.error("User is not logged in.");
      navigate("/login");
    }
  };

  // Function to handle view (show image gallery)
  const handleView = (hotelId) => {
    setSelectedHotel(hotelId);
  };

  return (
    <div className="landing-page">
      <h1>Accommodation Listings</h1>
      <div className="hotel-cards-container">
        {hotels.map((hotel) => (
          <div key={hotel.id} className="hotel-card">
            <img src={hotel.imageUrls[0]} alt="Hotel" className="hotel-image" style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
            <div className="hotel-details">
              <h2>{hotel.name}</h2>
              <p>
                <strong>Location:</strong> {hotel.address}, {hotel.city}
              </p>
              <p>
                <strong>Price:</strong> ${hotel.pricePerNight} / night
              </p>
              <div className="button-container">
                <button className="button primary" onClick={() => handleBook(hotel.id)}>
                  Book Now
                </button>
                <button className="button secondary" onClick={() => handleView(hotel.id)}>
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conditional rendering to show the gallery for selected hotel */}
      {selectedHotel && (
        <div className="hotel-gallery">
          <h2>Hotel Gallery</h2>
          {hotels
            .filter((hotel) => hotel.id === selectedHotel)
            .flatMap((hotel) =>
              hotel.imageUrls.map((url, index) => (
                <img key={index} src={url} alt={`Gallery ${index}`} style={{ width: '150px', height: '150px', margin: '5px' }} />
              ))
            )}
          <button onClick={() => setSelectedHotel(null)}>Close Gallery</button>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
