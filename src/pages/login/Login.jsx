import { useContext, useState } from "react";
import "./login.scss";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore"; // Import Firestore

const Login = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Access dispatch for current user
  const { dispatch } = useContext(AuthContext);

  // Initialize Firestore
  const db = getFirestore();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user; // This comes from Firebase

      // Fetch user data from Firestore, assuming the user ID is the document ID
      const userDocRef = doc(db, "users", user.uid); // Replace with your Firestore collection path
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Check the user's role and navigate accordingly
        if (userData.role === "admin") {
          navigate("/home"); // Admins go to the Home page
        } else {
          navigate("/"); // Non-admin users go to the Landing Page
        }

        // Dispatch user to the context
        dispatch({ type: "LOGIN", payload: user });
      } else {
        console.error("No user document found!");
        setError(true);
      }
    } catch (error) {
      console.error(error);
      setError(true); // Show error message
    }
  };

  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Submit</button>
        <p>Create account?</p>
        <a href="/register">Register Here</a>
        {error && <span>Wrong email or password!</span>}
      </form>
    </div>
  );
};

export default Login;
