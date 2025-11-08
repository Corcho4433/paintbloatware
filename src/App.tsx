import FastDraws from './pages/FastDraws'
import './App.css'

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/Login'
import HomePage from './pages/Home'
import Drawing from './pages/Drawing'
import UserPage from './pages/UserPage';
import Upload from './pages/Upload';
import WikiPage from './pages/wiki';
import { lazy } from 'react'
import OAuthSuccessPopup from './pages/OAuthSuccess';
import SinglePost from './pages/singlePost';
import LogoutPage from './pages/Logout';
const AdminDashboard = lazy(()=> import('./pages/Dashboard'))
const SettingsPage = lazy(()=> import('./pages/settingsPage'))

import NitroPage from './pages/NitroPage';


function App() {
 


  return (
    <>
      <div id='page-container' className="page-container bg-gray-900">
        
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Navigate to="/home" replace />} />
              <Route path='/login' element={<RegisterPage></RegisterPage>} />
              <Route path='/dashboard' element={<AdminDashboard />} />
              <Route path='/home' element={<HomePage></HomePage>} />
              <Route path='/fastdraws' element={<FastDraws></FastDraws>} />
              <Route path='/draw' element={<Drawing></Drawing>} />
              <Route path='/wiki' element={<WikiPage></WikiPage>} />
              <Route path='/user/:id' element={<UserPage></UserPage>} />
              <Route path='/upload' element={<Upload></Upload>} />
              <Route path='/post/:id' element={<SinglePost></SinglePost>} />
              <Route path='/oauth/success' element={<OAuthSuccessPopup></OAuthSuccessPopup>} />
              <Route path='/settings' element={<SettingsPage />}  />
              <Route path='/logout' element={<LogoutPage />} />
              <Route path="/comprar-nitro" element={<NitroPage />} />
            </Routes>

          </BrowserRouter>

        

      </div>
    </>
  )
}

export default App
