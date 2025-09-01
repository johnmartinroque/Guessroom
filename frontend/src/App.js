import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JoinLobby from "./screens/JoinLobby";
import Home from "./screens/Home";
import Header from "./components/Header";
function App() {
  return (
    <div>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join" element={<JoinLobby />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
