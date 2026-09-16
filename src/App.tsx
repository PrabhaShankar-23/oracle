import { BrowserRouter, Route, Routes } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import NoteView from './pages/NoteView'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="notes/*" element={<NoteView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
