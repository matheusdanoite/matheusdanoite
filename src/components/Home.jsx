import React, { useState, useRef, useEffect } from 'react';
import Profile3D from './Profile3D';
import MusicWindow from './MusicWindow';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import styled from 'styled-components';
import Draggable from 'react-draggable';

const Wrapper = styled.div`
  width: 100%;
  max-width: 1200px; // Wider max-width for desktop
  margin: 0 auto;
  position: relative;
  
  // Mobile Layout (Default)
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
  padding-bottom: 50px;

  // Desktop Layout
  @media (min-width: 769px) {
    display: block; // Allow absolute positioning children relative to this
    height: 80vh; // Fixed height area for "desktop" feel
    padding-top: 20px;
  }
`;

const DraggableWindow = ({ id, title, children, onClose, onFocus, style, windowStyle, defaultPosition, isMobile }) => {
    const nodeRef = useRef(null);

    return (
        <Draggable
            nodeRef={nodeRef}
            handle=".window-header"
            onMouseDown={() => onFocus(id)}
            defaultPosition={defaultPosition}
            disabled={isMobile} // Optional: Disable dragging on mobile if preferred? User asked for "responsive... maintaining disposition". Dragging on mobile is often annoying. Let's keep it enabled but stacked? User said "Mobile... mantendo a disposição uma em seguida da outra". Stacking implies static. Let's ENABLE dragging but start stacked. Actually, if I use position:relative on mobile, dragging works via transform.
        >
            <div ref={nodeRef} style={{ ...style, zIndex: style.zIndex }}>
                <Window style={{ width: '100%', maxWidth: '600px', ...windowStyle }} className="window">
                    <WindowHeader className="window-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'grab' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {title}
                        </span>
                        <Button onClick={() => onClose(id)} size='sm' square>
                            <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>x</span>
                        </Button>
                    </WindowHeader>
                    <WindowContent style={{ padding: 0 }}>
                        {children}
                    </WindowContent>
                </Window>
            </div>
        </Draggable>
    );
};

const getRandomPosition = () => {
    // Random position between 5% and 40% for left, 20px and 150px for top
    const top = Math.floor(Math.random() * (150 - 20 + 1)) + 20;
    const left = Math.floor(Math.random() * (40 - 5 + 1)) + 5;
    return { top, left };
};

const Home = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [windows, setWindows] = useState(() => {
        const pos1 = getRandomPosition();
        const pos2 = getRandomPosition();

        // Ensure they aren't too close? Simple random is fine for now as requested.
        return {
            model: {
                id: 'model',
                title: 'eu_3d',
                isOpen: true,
                zIndex: 1,
                content: <Profile3D />,
                desktopPosition: { top: `${pos1.top}px`, left: `${pos1.left}%` }
            },
            about: {
                id: 'about',
                title: 'sobre_mim',
                isOpen: true,
                zIndex: 0,
                content: (
                    <div style={{ padding: '1rem' }}>
                        <h3 style={{ marginTop: 0 }}>Sobre mim</h3>
                        <p>
                            [Escreva aqui sobre você...]
                        </p>
                        <br />
                        <p>
                            Olá! Sou Matheus José, um desenvolvedor apaixonado por criar experiências digitais únicas.
                            Este portfólio é uma janela para o meu mundo, misturando nostalgia e tecnologia moderna.
                        </p>
                    </div>
                ),
                desktopPosition: { top: `${pos2.top + 50}px`, left: `${pos2.left + 20}%` } // Start second window slightly offset from random base or completely random? 
                // Let's make second window completely random but broadly different range to avoid total overlap?
                // Or just independent random. Let's do independent but slightly biased to right to fill screen.
            }
        };
    });

    // Recalculate 'about' position to be independent random logic inside hook above was cleaner.
    // Let's refine the useState initializer to be more explicit.


    const closeWindow = (id) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: false }
        }));
    };

    const focusWindow = (id) => {
        setWindows(prev => {
            const newWindows = { ...prev };
            const maxZ = Math.max(...Object.values(newWindows).map(w => w.zIndex)) + 1;
            newWindows[id] = { ...newWindows[id], zIndex: maxZ };
            return newWindows;
        });
    };

    return (
        <Wrapper>
            {/* 3D Model Window */}
            {windows.model.isOpen && (
                <DraggableWindow
                    id="model"
                    title={windows.model.title}
                    onClose={closeWindow}
                    onFocus={focusWindow}
                    isMobile={isMobile}
                    style={{
                        zIndex: windows.model.zIndex,
                        position: isMobile ? 'relative' : 'absolute',
                        left: isMobile ? 0 : '5%',
                        top: isMobile ? 0 : '20px',
                    }}
                    windowStyle={{ width: '100%', maxWidth: '500px' }}
                >
                    {windows.model.content}
                </DraggableWindow>
            )}

            {/* Bio Window - Overlapping on Desktop */}
            {windows.about.isOpen && (
                <DraggableWindow
                    id="about"
                    title={windows.about.title}
                    onClose={closeWindow}
                    onFocus={focusWindow}
                    isMobile={isMobile}
                    style={{
                        zIndex: windows.about.zIndex,
                        position: isMobile ? 'relative' : 'absolute',
                        left: isMobile ? 0 : '40%', // Offset horizontally for overlap
                        top: isMobile ? 0 : '80px',  // Offset vertically for overlap
                    }}
                >
                    {windows.about.content}
                </DraggableWindow>
            )}

            {/* Music Window */}
            {windows.music.isOpen && (
                <DraggableWindow
                    id="music"
                    title={windows.music.title}
                    onClose={closeWindow}
                    onFocus={focusWindow}
                    isMobile={isMobile}
                    style={{
                        zIndex: windows.music.zIndex,
                        position: isMobile ? 'relative' : 'absolute',
                        left: isMobile ? 0 : windows.music.desktopPosition.left,
                        top: isMobile ? 0 : windows.music.desktopPosition.top,
                    }}
                    windowStyle={{ width: '100%', maxWidth: '350px' }}
                >
                    {windows.music.content}
                </DraggableWindow>
            )}

            {!windows.model.isOpen && !windows.about.isOpen && !windows.music.isOpen && (
                <div style={{ textAlign: 'center', marginTop: '100px', color: 'gray', width: '100%' }}>
                    <p>Todas as janelas foram fechadas.</p>
                    <Button onClick={() => window.location.reload()}>Reiniciar Sistema</Button>
                </div>
            )}
        </Wrapper>
    );
};

export default Home;
