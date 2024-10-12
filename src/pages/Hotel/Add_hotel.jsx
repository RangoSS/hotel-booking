import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../../firebase'; // Assuming Firebase is configured in this file
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddHotel = () => {
    const [phone, setPhone] = useState('');
    const [imageFiles, setImageFiles] = useState([]); // To hold multiple images
    const [imagePreviews, setImagePreviews] = useState([]); // For displaying image previews
    const [pricePerNight, setPricePerNight] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [address, setAddress] = useState('');
    const [hotelType, setHotelType] = useState('beachfront'); // Default hotel type
    const [city, setCity] = useState('');
    const [ratings, setRatings] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle image upload to state
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (imageFiles.length + files.length > 50) {
            setError("You can upload a maximum of 50 images.");
            return;
        }
        setImageFiles([...imageFiles, ...files]);
        setImagePreviews([...imagePreviews, ...files.map(file => URL.createObjectURL(file))]);
        setError('');
    };

    // Upload each image to Firebase Storage and return its download URL
    const uploadImages = async () => {
        const uploadedImageUrls = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const storageRef = ref(storage, `hotelImages/${file.name}-${Date.now()}`); // Create a unique name
            await uploadBytes(storageRef, file); // Upload image
            const downloadURL = await getDownloadURL(storageRef); // Get download URL
            uploadedImageUrls.push(downloadURL); // Push the URL to the array
        }
        return uploadedImageUrls; // Return array of image URLs
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Step 1: Upload images and get their download URLs
            const uploadedImageUrls = await uploadImages();

            // Step 2: Add hotel data to Firestore along with image URLs
            await addDoc(collection(db, 'hotels'), {
                phone,
                pricePerNight,
                pricePerDay,
                address,
                hotelType,
                city,
                ratings,
                imageUrls: uploadedImageUrls, // Save image URLs to Firestore
                createdAt: serverTimestamp(),
            });

            // Step 3: Reset form after successful submission
            setPhone('');
            setPricePerNight('');
            setPricePerDay('');
            setAddress('');
            setHotelType('beachfront');
            setCity('');
            setRatings('');
            setImageFiles([]);
            setImagePreviews([]);
            setError('');
            // Reset the file input field
            document.querySelector('input[type="file"]').value = '';

        } catch (error) {
            console.error('Error adding hotel:', error);
            setError('Failed to register hotel. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-hotel">
            <form className="mt-5" onSubmit={handleSubmit}>
                <h2>Add Hotel Information</h2>
                <a className="btn btn-primary" href='/hotel'>Back</a>
                {error && <p className="text-danger">{error}</p>}
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Price per night" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Price per day" value={pricePerDay} onChange={(e) => setPricePerDay(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                </div>
                <div className="form-group">
                    <select className="form-control" value={hotelType} onChange={(e) => setHotelType(e.target.value)} required>
                        <option value="beachfront">Beachfront</option>
                        <option value="countryside">Countryside</option>
                        <option value="cabins">Cabins</option>
                        <option value="lakes">Lakes</option>
                        <option value="bed and breakfast">Bed and Breakfast</option>
                    </select>
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="City or Area" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="ratings" value={ratings} onChange={(e) => setRatings(e.target.value)} required />
                </div>
                {/* Image upload */}
                <div className="form-group">
                    <p>Upload hotel images (Max 50)</p>
                    <input type="file" className="form-control" multiple onChange={handleImageUpload} />
                </div>

                {/* Image previews */}
                <div className="image-preview-container">
                    {imagePreviews.map((preview, index) => (
                        <div key={index} className="image-preview">
                            <img src={preview} alt={`Preview ${index}`} style={{ width: '100px', height: '100px', margin: '5px' }} />
                        </div>
                    ))}
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default AddHotel;
