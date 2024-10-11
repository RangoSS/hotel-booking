import { createContext, useEffect, useReducer } from "react";
import AuthReducer from "./AuthReducer";

// Initial state for the authentication context
const INITIAL_STATE = {
  currentUser: JSON.parse(localStorage.getItem('user')) || null, // No user is logged in initially
};

// Create the authentication context
export const AuthContext = createContext(INITIAL_STATE);

// Provider component for authentication context
export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE); // Use reducer to manage state
  
 useEffect(()=>{
    localStorage.setItem('user',JSON.stringify(state.currentUser))//save user on localstorage
 },[state.currentUser])
  return (
    <AuthContext.Provider value={{ currentUser: state.currentUser, dispatch }}>
      {children} {/* Render child components */}
    </AuthContext.Provider>
  );
};
