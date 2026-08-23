import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';

// Lazy load the routes that aren't the landing page
const PortfolioPage = React.lazy(() => import('./components/PortfolioPage'));
const StudioPage = React.lazy(() => import('./components/StudioPage'));

const RouteFallback: React.FC = () => (
    <div className="h-screen w-full bg-black flex items-center justify-center text-white">Loading...</div>
);

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route
                    path="/portfolio"
                    element={
                        <React.Suspense fallback={<RouteFallback />}>
                            <PortfolioPage />
                        </React.Suspense>
                    }
                />
                <Route
                    path="/studio"
                    element={
                        <React.Suspense fallback={<RouteFallback />}>
                            <StudioPage />
                        </React.Suspense>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
