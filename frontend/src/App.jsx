import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import PublicMenuPage from './pages/PublicMenuPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/carta/:slug" element={<PublicMenuPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
