import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import AppShell from './components/layout/AppShell'
import { sections } from './content/sections'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import SectionPage from './pages/SectionPage'

// Content pages are split out so each one downloads only when opened.
const ColdRecallPage = lazy(() => import('./pages/dsa/ColdRecallPage'))
const CaseStudiesIndexPage = lazy(() => import('./pages/system-design/CaseStudiesIndexPage'))
const CaseStudyPage = lazy(() => import('./pages/system-design/CaseStudyPage'))
const WebRtcPage = lazy(() => import('./pages/system-design/WebRtcPage'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          {sections.map((s) => (
            <Route key={s.id} path={s.path} element={<SectionPage />} />
          ))}
          <Route path="dsa/cold-recall" element={<ColdRecallPage />} />
          <Route path="system-design/case-studies" element={<CaseStudiesIndexPage />} />
          <Route path="system-design/case-studies/:slug" element={<CaseStudyPage />} />
          <Route path="system-design/webrtc" element={<WebRtcPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
