import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import AppShell from './components/layout/AppShell'
import { sections } from './content/sections'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import SectionPage from './pages/SectionPage'

// Content pages are split out so each one downloads only when opened.
const ColdRecallPage = lazy(() => import('./pages/dsa/ColdRecallPage'))
const PlaybookPage = lazy(() => import('./pages/dsa/PlaybookPage'))
const PythonUtilsPage = lazy(() => import('./pages/dsa/PythonUtilsPage'))
const JavaUtilsPage = lazy(() => import('./pages/dsa/JavaUtilsPage'))
const CaseStudiesIndexPage = lazy(() => import('./pages/system-design/CaseStudiesIndexPage'))
const CaseStudyPage = lazy(() => import('./pages/system-design/CaseStudyPage'))
const WebRtcPage = lazy(() => import('./pages/system-design/WebRtcPage'))
const AiSystemsPage = lazy(() => import('./pages/system-design/AiSystemsPage'))
const GameDayRecallPage = lazy(() => import('./pages/game-day/GameDayRecallPage'))
const GameDayDocPage = lazy(() => import('./pages/game-day/GameDayDocPage'))

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
          <Route path="dsa/playbook" element={<PlaybookPage />} />
          <Route path="dsa/python-utils" element={<PythonUtilsPage />} />
          <Route path="dsa/java-utils" element={<JavaUtilsPage />} />
          <Route path="system-design/case-studies" element={<CaseStudiesIndexPage />} />
          <Route path="system-design/case-studies/:slug" element={<CaseStudyPage />} />
          <Route path="system-design/webrtc" element={<WebRtcPage />} />
          <Route path="system-design/ai-systems/:slug" element={<AiSystemsPage />} />
          <Route path="game-day/recall/:slug" element={<GameDayRecallPage />} />
          <Route path="game-day/:slug" element={<GameDayDocPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
