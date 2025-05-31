import FastDraws from './fastdraws/fastdraws'
import './App.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


function App() {
  const LoginFormClient = new QueryClient();
  

  return (
    <>
      <div className="page-container">
        <QueryClientProvider client={LoginFormClient}> 
          <FastDraws />
        </QueryClientProvider>
      </div>
    </>
  )
}

export default App
