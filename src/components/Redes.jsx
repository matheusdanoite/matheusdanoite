import React, { useState, useRef, useEffect } from 'react';
import { Window, WindowHeader, WindowContent, Button } from 'react95';
import Draggable from 'react-draggable';
import styled from 'styled-components';
import MusicWindow from './MusicWindow';
import BlueSkyWindow from './BlueSkyWindow';
import SteamWindow from './SteamWindow';
import DiscordWindow from './DiscordWindow';

const Wrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  
  // Desktop Layout (Default base for Styled Components logic)
  @media (min-width: 769px) {
    display: block; 
    min-height: 100vh; /* Match Home/Projects for consistent full screen */
    padding-top: 20px;
  }

  // Mobile Layout
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 20px;
    align-items: center;
    padding-bottom: 50px;
  }
`;

const WindowContainer = styled.div`
  z-index: ${props => props.$zIndex};
  
  /* Desktop Styles */
  @media (min-width: 769px) {
    position: absolute;
    left: ${props => props.$left};
    top: ${props => props.$top ? props.$top : 'auto'};
    bottom: ${props => props.$bottom ? props.$bottom : 'auto'};
  }

  /* Mobile Styles */
  @media (max-width: 768px) {
    position: relative !important;
    left: auto !important;
    top: auto !important;
    width: 100%;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
  }
`;

const RestartButtonContainer = styled.div`
  z-index: 9999;
  
  /* Desktop Position */
  @media (min-width: 769px) {
    position: absolute;
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Mobile Position */
  @media (max-width: 768px) {
    width: 100%;
    display: flex;
    justify-content: center;
    margin-top: 50px;
  }
`;



const DraggableWindow = ({ id, title, children, onClose, onFocus, zIndex, desktopPos, isMobile, windowWidth, windowHeight, innerRef }) => {
    const nodeRef = useRef(null);


    return (
        <Draggable
            nodeRef={nodeRef}
            handle=".window-header"
            onMouseDown={() => onFocus(id)}
            disabled={isMobile}
            position={isMobile ? { x: 0, y: 0 } : undefined}
        >
            <WindowContainer ref={nodeRef} $zIndex={zIndex} $left={desktopPos.left} $top={desktopPos.top} $bottom={desktopPos.bottom}>
                <Window style={{ width: windowWidth, height: windowHeight, maxWidth: '95vw', display: 'flex', flexDirection: 'column', position: 'relative' }} className="window">
                    <WindowHeader className="window-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: isMobile ? 'default' : 'grab' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {title}
                        </span>
                        <Button onClick={() => onClose(id)} size='sm' square>
                            <span style={{ fontWeight: 'bold', transform: 'translateY(-1px)' }}>x</span>
                        </Button>
                    </WindowHeader>


                    <WindowContent style={{ padding: 0, flex: 1, overflowY: 'auto' }} ref={innerRef}>
                        {children}
                    </WindowContent>
                </Window>
            </WindowContainer>
        </Draggable >
    );
};

const Redes = () => {
    // Mobile Detection
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const musicRef = useRef(null);
    const [musicHeight, setMusicHeight] = useState(0);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);

        // Measure music window height
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                if (entry.target === musicRef.current) {
                    setMusicHeight(entry.contentRect.height + 34); // + window header approx
                }
            }
        });

        if (musicRef.current) observer.observe(musicRef.current);

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, []);

    // Window State
    const [windows, setWindows] = useState({
        music: {
            id: 'music',
            title: 'last.fm',
            isOpen: true,
            zIndex: 1,
            content: <MusicWindow />,
            width: '300px',
            desktopPos: { top: '20px', left: '20px' }
        },
        bluesky: {
            id: 'bluesky',
            title: 'bluesky',
            isOpen: true,
            zIndex: 2,
            content: <BlueSkyWindow />,
            width: '480px',
            desktopPos: { top: '20px', left: '340px' }
        },
        steam: {
            id: 'steam',
            title: 'steam',
            isOpen: true,
            zIndex: 1,
            content: <SteamWindow />,
            width: '350px',
            desktopPos: { top: '20px', left: '840px' }
        },
        /* discord: {
            id: 'discord',
            title: 'discord',
            isOpen: true,
            zIndex: 3,
            content: <DiscordWindow />,
            width: '300px',
            desktopPos: { top: `${20 + musicHeight + 75}px`, left: '20px' }
        } */
    });

    const closeWindow = (id) => {
        setWindows(prev => ({
            ...prev,
            [id]: { ...prev[id], isOpen: false }
        }));
    };

    const focusWindow = (id) => {
        if (isMobile) return;
        setWindows(prev => {
            const newWindows = { ...prev };
            const maxZ = Math.max(...Object.values(newWindows).map(w => w.zIndex));
            if (newWindows[id].zIndex <= maxZ) {
                newWindows[id] = { ...newWindows[id], zIndex: maxZ + 1 };
            }
            return newWindows;
        });
    };

    const handleReset = () => {
        setWindows(prev => {
            const newWindows = { ...prev };
            Object.keys(newWindows).forEach(key => {
                newWindows[key].isOpen = true;
                newWindows[key].zIndex = 1; // Reset Z-index logic if needed
            });
            // Give one window focus or staggered Z-index? 
            // Let's keep it simple: Music=1, BlueSky=2, Xbox=1 (default state)
            newWindows.music.zIndex = 1;
            newWindows.bluesky.zIndex = 2;
            newWindows.steam.zIndex = 1;
            // newWindows.discord.zIndex = 1;
            return newWindows;
        });
    };

    const allClosed = Object.values(windows).every(w => !w.isOpen);

    return (
        <Wrapper>
            {Object.values(windows).map(win => (
                win.isOpen && (
                    <DraggableWindow
                        key={`${win.id}-${isMobile}`}
                        id={win.id}
                        title={win.title}
                        onClose={closeWindow}
                        onFocus={focusWindow}
                        zIndex={win.zIndex}
                        desktopPos={win.desktopPos}
                        isMobile={isMobile}
                        windowWidth={win.width}
                        windowHeight={win.height}
                        innerRef={win.id === 'music' ? musicRef : null}
                    >
                        {win.content}
                    </DraggableWindow>
                )
            ))}

            {allClosed && (
                <RestartButtonContainer>
                    <Button
                        onClick={handleReset}
                        style={{ width: '200px', height: '50px', fontWeight: 'bold' }}
                    >
                        Reiniciar Sistema
                    </Button>
                </RestartButtonContainer>
            )}


        </Wrapper>
    );
};

export default Redes;
