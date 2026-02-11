import React, { useState, useEffect } from 'react';
import Navigation from './Navigation';
import AsciiArt from './AsciiArt';
import RandomPhrase from './RandomPhrase';
import Home from './Home';
import Redes from './Redes';
import Projects from './Projects';
import Twitter from './Twitter';
import Instagram from './Instagram';
import OrkutWindow from './Orkut/OrkutWindow';

const Desktop = () => {
    const getInitialSection = () => {
        const path = window.location.pathname;
        if (path === '/projetos') return 'projects';
        if (path === '/escritos') return 'resume';
        if (path === '/redes') return 'contact';
        if (path === '/projetos/orkut') return 'orkut';
        if (path === '/projetos/twitter') return 'twitter';
        if (path === '/projetos/instagram') return 'instagram';
        return 'home';
    };

    const [activeSection, setActiveSection] = useState(getInitialSection);

    useEffect(() => {
        const getPathForSection = (section) => {
            switch (section) {
                case 'projects': return '/projetos';
                case 'resume': return '/escritos';
                case 'contact': return '/redes';
                case 'orkut': return '/projetos/orkut';
                case 'twitter': return '/projetos/twitter';
                case 'instagram': return '/projetos/instagram';
                case 'home': return '/';
                default: return '/';
            }
        };

        const path = getPathForSection(activeSection);
        if (window.location.pathname !== path) {
            window.history.pushState({ section: activeSection }, '', path);
        }

        if (activeSection === 'orkut') {
            document.body.style.backgroundColor = '#D4DDEE';
        } else if (activeSection === 'instagram') {
            document.body.style.backgroundColor = '#000';
        } else if (activeSection === 'twitter') {
            document.body.style.backgroundColor = 'rgb(0, 132, 180)';
        } else {
            document.body.style.backgroundColor = '';
        }

        return () => {
            document.body.style.backgroundColor = '';
        };
    }, [activeSection]);

    useEffect(() => {
        const handlePopState = (event) => {
            const path = window.location.pathname;
            if (path === '/projetos/orkut') setActiveSection('orkut');
            else if (path === '/projetos/twitter') setActiveSection('twitter');
            else if (path === '/projetos/instagram') setActiveSection('instagram');
            else if (path === '/projetos') setActiveSection('projects');
            else if (path === '/escritos') setActiveSection('resume');
            else if (path === '/redes') setActiveSection('contact');
            else setActiveSection('home');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    const renderContent = () => {
        switch (activeSection) {
            case 'home':
                return <Home />;
            case 'projects':
                return <Projects onNavigate={setActiveSection} />;
            case 'resume':
                return (
                    <div style={{ textAlign: 'center', color: 'var(--win-gray-dark)', marginTop: '2rem', minHeight: '100vh' }}>
                        <p>Vem aí...?</p>
                    </div>
                );
            case 'contact':
                return <Redes />;

            default:
                return null;
        }
    };

    if (activeSection === 'orkut') {
        return (
            <>
                <Navigation activeSection={activeSection} onNavigate={setActiveSection} />
                <div style={{
                    paddingTop: '40px',
                    minHeight: '100vh',
                    boxSizing: 'border-box',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <OrkutWindow />
                </div>
            </>
        );
    }

    if (activeSection === 'twitter') {
        return (
            <>
                <Navigation activeSection={activeSection} onNavigate={setActiveSection} />
                <div style={{ paddingTop: '40px', minHeight: '100vh', boxSizing: 'border-box' }}>
                    <Twitter />
                </div>
            </>
        );
    }

    if (activeSection === 'instagram') {
        return (
            <>
                <Navigation activeSection={activeSection} onNavigate={setActiveSection} />
                <div style={{ paddingTop: '40px', minHeight: '100vh', boxSizing: 'border-box' }}>
                    <Instagram onClose={() => setActiveSection('home')} />
                </div>
            </>
        );
    }

    return (
        <>
            {/* Navigation Bar (Fixed Top) */}
            <Navigation activeSection={activeSection} onNavigate={setActiveSection} />

            <main style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                paddingTop: '50px', // Compensate for fixed AppBar
                paddingBottom: '50px',
                gap: '10px'
            }}>
                {/* Header / Hero Area */}
                <AsciiArt />
                <RandomPhrase />

                {/* Main Content Area (Dynamic) */}
                <div style={{ marginTop: '20px' }}>
                    {renderContent()}
                </div>

                {/* Footer */}
                <footer style={{
                    textAlign: 'center',
                    padding: '2rem 0 1rem 0',
                    marginTop: 'auto',
                    color: 'blue', // Updated to blue as requested
                    fontSize: '0.85rem',
                    opacity: 0.7
                }}>
                    <p style={{ margin: 0 }}>Pensado por Matheus José da Silva</p>
                    <p style={{ margin: 0 }}>Guarapuava, 2026</p>
                </footer>
            </main>
        </>
    );
};

export default Desktop;
