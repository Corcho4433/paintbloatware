import FastDraws from './pages/fastdraws'
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDom from 'react-dom/client'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import RegisterPage from './pages/login'

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
