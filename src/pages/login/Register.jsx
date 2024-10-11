import React, { useEffect, useState } from 'react';
import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Removed unused `uploadBytesResumable`
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [surname, setSurname] = useState('');
    const [phone, setPhone] = useState('');
    const [position, setPosition] = useState('user');  // Default position
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');  // For error handling
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // If there's an image, upload it
            let imageUrl = '';
            if (image) {
                const imageRef = ref(storage, `profileImages/${user.uid}`);
                //const storageRef = ref(storage, file.name); //storage reference
                await uploadBytes(imageRef, image);  // Upload profile image
                imageUrl = await getDownloadURL(imageRef);
            }

            // Save user data to Firestore
            await setDoc(doc(db, 'users', user.uid), {
                name,
                surname,
                username,
                phone,
                position,
                email,
                profileImageUrl: imageUrl,  // Save image URL
                createdAt: serverTimestamp(),
            });

            // Navigate to login page after successful registration
            navigate('/login');
        } catch (error) {
            console.error('Error registering user:', error);
            setError('Failed to register. Please try again.');  // Display friendly error message
        }
    };

    return (
        <div className="register">
            <form className="mt-5" onSubmit={handleSubmit}>
                <h2>Register</h2>
                {error && <p className="text-danger">{error}</p>} {/* Display error if exists */}
                <div className="form-group">
                    <input type="email" className="form-control" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="password" className="form-control" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="surname" value={surname} onChange={(e) => setSurname(e.target.value)} required />
                </div>
                <div className="form-group">
                    <input type="text" className="form-control" placeholder="cell" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="form-group">
                    <p className="ml-2">Upload profile image</p>
                    <input type="file" className="form-control" onChange={(e) => setImage(e.target.files[0])} />
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="position" value="admin" checked={position === 'admin'} onChange={(e) => setPosition(e.target.value)} />
                    <label className="form-check-label">Admin</label>
                </div>
                <div className="form-check">
                    <input className="form-check-input" type="radio" name="position" value="user" checked={position === 'user'} onChange={(e) => setPosition(e.target.value)} />
                    <label className="form-check-label">User</label>
                </div>
                <button type="submit" className="btn btn-primary">Register</button>
            </form>
        </div>
    );
};

export default Register;
