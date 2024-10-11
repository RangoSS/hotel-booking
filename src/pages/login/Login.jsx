import { useContext, useState } from "react"
import "./login.scss"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
const Login = () => {
  const [error, setError] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // dispatch is going to acces current user
  const { dispatch } = useContext(AuthContext)
  const handleLogin = (e) => {
    e.preventDefault()
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;//this come from firebase
        dispatch({ type: 'LOGIN', payload: user })
        console.log(user);
        navigate('/home');
      })
      .catch((error) => {
        setError(true);
      });
  }
  return (
    <div className="login">
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="email" onChange={(e) => setEmail(e.target.value)} />
        <input type="password" placeholder="password" onChange={(e) => setPassword(e.target.value)} />
        <button type="submit">submit</button>
        <p>Create account ?</p>
        <a href="/register">Register Here</a>
        {error && <span>wrong email or passwords!</span>}
      </form>
    </div>
  )
}

export default Login