import FastDraws from './pages/fastdraws'
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReactDom from 'react-dom/client'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import RegisterPage from './pages/login'
import HomePage from './pages/home' 
function App() {
  const PaintQueryClient = new QueryClient();
  

  return (
    <>
      <div className="page-container">
        <QueryClientProvider client={PaintQueryClient}> 
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<FastDraws></FastDraws>} />
              <Route path='/login' element={<RegisterPage></RegisterPage>} />
              <Route path='/home' element={<HomePage></HomePage>} />
              <Route path='/fastdraws' element={<FastDraws></FastDraws>} />
            </Routes>

          </BrowserRouter>
          
        </QueryClientProvider>
        
      </div>
    </>
  )
}

export default App
