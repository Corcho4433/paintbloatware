import FastDraws from './pages/FastDraws'
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RegisterPage from './pages/Login'

function App() {
  const LoginFormClient = new QueryClient();


  return (
    <>
      <div className="page-container">
        <QueryClientProvider client={LoginFormClient}>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<FastDraws></FastDraws>} />
              <Route path='/login' element={<RegisterPage></RegisterPage>} />

            </Routes>

          </BrowserRouter>

        </QueryClientProvider>

      </div>
    </>
  )
}

export default App
