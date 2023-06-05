import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "./userContext";
import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Logout from "./components/Logout";
import Attractions from "./components/Attractions";
import CreateAttractions from "./components/CreateAttraction";
import Graphs from "./components/Graphs";
import Map from "./components/Map";
import Landing from './components/Landing';


function App() {

  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
  const updateUserData = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  }

  return (
    <BrowserRouter>
      <UserContext.Provider value={{
        user: user,
        setUserContext: updateUserData
      }}>
        <div className="App">
          <Header title="Outsiders"></Header>
          <Routes>
            <Route path="/login" exact element={<Login />}></Route>
            <Route path="/register" element={<Register />}></Route>
            <Route path="/profile" element={<Profile />}></Route>
            <Route path="/map" element={<Map />}></Route>
            <Route path="/logout" element={<Logout />}></Route>
            <Route path="/attractions" element={<Attractions />}></Route>
            <Route path="/createAttraction" element={<CreateAttractions />}></Route>
            <Route path="/graphs" element={<Graphs />}></Route>
            <Route path="/" element={<Landing/>}></Route>
          </Routes>
        </div>
      </UserContext.Provider>
    </BrowserRouter>
  );
}

export default App;
