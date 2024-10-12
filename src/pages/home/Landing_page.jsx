import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import { FacebookShareButton, WhatsappShareButton, FacebookIcon, WhatsappIcon } from 'react-share'; // Importing share buttons
import Rating from 'react-rating-stars-component'; // Importing Rating component
import './landing_page.scss';
import Navbar from "../../components/navbar/Navbar";

const LandingPage = () => {
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [userRating, setUserRating] = useState(0); // Track user rating
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

  // Function to handle view (show modal)
  const handleView = (hotel) => {
    setSelectedHotel(hotel);
    setUserRating(hotel.rating || 0); // Set current rating
  };

  // Function to close the modal
  const handleClose = () => {
    setSelectedHotel(null);
  };

  // Function to handle rating submission
  const handleRating = async (newRating) => {
    if (selectedHotel) {
      const hotelRef = doc(db, "hotels", selectedHotel.id);
      await updateDoc(hotelRef, { rating: newRating });
      setUserRating(newRating);
    }
  };

  return (
    <div className="landing-page">
      <Navbar />
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
                <strong>Price Per Night:</strong> ${hotel.pricePerNight || 'N/A'}
              </p>
              <p>
                <strong>Price Per Day:</strong> ${hotel.pricePerDay || 'N/A'}
              </p>
              <p>
                <strong>Type:</strong> {hotel.hotelType || 'N/A'}
              </p>
              <div className="button-container">
                <button className="button primary" onClick={() => handleBook(hotel.id)}>
                  Book Now
                </button>
                <button className="button secondary" onClick={() => handleView(hotel)}>
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for showing selected hotel details */}
      <Modal show={selectedHotel !== null} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedHotel?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h5>Details</h5>
          <p><strong>Location:</strong> {selectedHotel?.address}, {selectedHotel?.city}</p>
          <p><strong>Price Per Night:</strong> ${selectedHotel?.pricePerNight || 'N/A'}</p>
          <p><strong>Price Per Day:</strong> ${selectedHotel?.pricePerDay || 'N/A'}</p>
          <p><strong>Type:</strong> {selectedHotel?.hotelType || 'N/A'}</p>
          <p><strong>Phone:</strong> {selectedHotel?.phone || 'N/A'}</p>
          <p><strong>Description:</strong> {selectedHotel?.description || 'N/A'}</p>

          <h5>Gallery</h5>
          <div className="hotel-gallery">
            {selectedHotel?.imageUrls.map((url, index) => (
              <img key={index} src={url} alt={`Gallery ${index}`} style={{ width: '100%', height: '150px', objectFit: 'cover', margin: '5px' }} />
            ))}
          </div>

          {/* Rating Component */}
          <h5>Rate this hotel</h5>
          <Rating
            count={5}
            value={userRating}
            size={30}
            activeColor="#ffd700"
            onChange={handleRating}
          />

          {/* Share Buttons */}
          <h5>Share this hotel</h5>
          <div className="share-buttons">
            <FacebookShareButton
              url={window.location.href} // Use the current page URL for sharing
              quote={`Check out this amazing hotel: ${selectedHotel?.name}!`}
              hashtag="#HotelBooking"
            >
              <FacebookIcon size={40} round />
            </FacebookShareButton>

            <WhatsappShareButton
              url={window.location.href}
              title={`Check out this amazing hotel: ${selectedHotel?.name}!`}
              separator=" - "
            >
              <WhatsappIcon size={40} round />
            </WhatsappShareButton>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={() => handleBook(selectedHotel.id)}>
            Book Now
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LandingPage;
