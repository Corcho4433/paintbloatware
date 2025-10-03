import FastDraws from './pages/FastDraws'
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/Login'
import HomePage from './pages/Home'
import Drawing from './pages/Drawing'
import UserPage from './pages/UserPage';
import Upload from './pages/Upload';
import WikiPage from './pages/wiki';
import OAuthSuccessPopup from './pages/OAuthSuccess';
import SinglePost from './pages/singlePost';
import SettingsPage from './pages/settingsPage';

function App() {
  const PaintQueryClient = new QueryClient();


  return (
    <>
      <div className="page-container">
        <QueryClientProvider client={PaintQueryClient}>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Navigate to="/fastdraws" replace />} />
              <Route path='/login' element={<RegisterPage></RegisterPage>} />
              <Route path='/home' element={<HomePage></HomePage>} />
              <Route path='/fastdraws' element={<FastDraws></FastDraws>} />
              <Route path='/draw' element={<Drawing></Drawing>} />
              <Route path='/wiki' element={<WikiPage></WikiPage>} />
              <Route path='/user/:id' element={<UserPage></UserPage>} />
              <Route path='/upload' element={<Upload></Upload>} />
              <Route path='/post/:id' element={<SinglePost></SinglePost>} />
              <Route path='/oauth/success' element={<OAuthSuccessPopup></OAuthSuccessPopup>} />
              <Route path='/settings' element={<SettingsPage />}  />
            </Routes>

          </BrowserRouter>

        </QueryClientProvider>

      </div>
    </>
  )
}

export default App
