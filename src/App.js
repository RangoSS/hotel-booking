import Home from "./pages/home/Home";
import Login from "./pages/login/Login";
import List from "./pages/list/List";
import Single from "./pages/single/Single";
import New from "./pages/new/New";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { productInputs, userInputs } from "./formSource";
import "./style/dark.scss";
import { useContext } from "react";
import { DarkModeContext } from "./context/darkModeContext";
import { AuthContext } from "./context/AuthContext";
import Register from "./pages/login/Register";
import Hotel from "./pages/Hotel/Hotel";
import Add_hotel from "./pages/Hotel/Add_hotel";

function App() {
  const { darkMode } = useContext(DarkModeContext);

  // Get currentUser from AuthContext
  const { currentUser } = useContext(AuthContext);
  
  // Protect routes for authenticated users
  const RequireAuth = ({ children }) => {
    return currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <BrowserRouter>
        <Routes>
          <Route path="/">
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route index element={<RequireAuth><Home /></RequireAuth>} />

            <Route path="users">
              <Route index element={<RequireAuth><List /></RequireAuth>} />
              <Route path=":userId" element={<RequireAuth><Single /></RequireAuth>} />
              <Route
                path="new"
                element={<RequireAuth><New inputs={userInputs} title="Add New User" /></RequireAuth>}
              />
            </Route>

            <Route path="products">
              <Route index element={<RequireAuth><List /></RequireAuth>} />
              <Route path=":productId" element={<RequireAuth><Single /></RequireAuth>} />
              <Route
                path="new"
                element={<RequireAuth><New inputs={productInputs} title="Add New Product" /></RequireAuth>}
              />
            </Route>

            {/* Move Hotel route outside of products */}
             <Route path="hotel" element={<RequireAuth><Hotel /></RequireAuth>} />
             <Route path="addhotel" element={<RequireAuth><Add_hotel /></RequireAuth>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
