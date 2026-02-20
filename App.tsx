import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';

// Lazy load the Portfolio Page
const PortfolioPage = React.lazy(() => import('./components/PortfolioPage'));

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/portfolio"
                    element={
                        <React.Suspense fallback={<div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading...</div>}>
                            <PortfolioPage />
                        </React.Suspense>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
