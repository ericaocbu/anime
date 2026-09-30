import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import PageContainer from "./components/layout/PageContainer";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import MyList from "./pages/MyList";
import Calendar from "./pages/Calendar";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import AnimeDetail from "./pages/AnimeDetail";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <PageContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/my-list" element={<MyList />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/anime/:id" element={<AnimeDetail />} />
        </Routes>
      </PageContainer>
    </BrowserRouter>
  );
}

export default App;