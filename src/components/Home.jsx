import React, { useState, useRef, useEffect, Suspense, lazy } from 'react';
const Profile3D = lazy(() => import('./Profile3D'));
import { Button } from 'react95';
import styled from 'styled-components';
import GuestbookWindow from './GuestbookWindow';
import DraggableWindow from './DraggableWindow';
import MessageWindow from './MessageWindow';
import BioContent from './BioContent';

import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';

const Wrapper = styled.div`
  width: 100%;
  max-width: 950px;
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
    display: block;
    // Dynamic height based on content
    min-height: 100vh; 
    padding-top: 20px;
    padding-bottom: 150px; // Space for Load More
  }
`;

// ... (DraggableWindow component imported) ...

const Home = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [messages, setMessages] = useState([]);
    const [messageLimit, setMessageLimit] = useState(15);
    const [closedMessageIds, setClosedMessageIds] = useState(new Set());

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch Messages
    useEffect(() => {
        if (!db) return;

        const q = query(
            collection(db, 'guestbook'),
            orderBy('createdAt', 'desc'),
            limit(messageLimit)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [messageLimit]);

    const [windows, setWindows] = useState({
        about: {
            id: 'about',
            title: 'bio',
            isOpen: true,
            zIndex: 1,
            content: <BioContent />,
            desktopPosition: { top: '20px', left: '50%' }
        },
        model: {
            id: 'model',
            title: 'eu',
            isOpen: true,
            zIndex: 0,
            content: <Profile3D />,
            desktopPosition: { top: '350px', left: '50%' }
        },
        guestbook: {
            id: 'guestbook',
            title: 'depoimentos',
            isOpen: true,
            zIndex: 0,
            content: <GuestbookWindow />, // Form Only
            desktopPosition: { top: '780px', left: '50%' }
        }
    });

    // Window Management
    const closeWindow = (id) => {
        // Check if it's a static window
        if (windows[id]) {
            setWindows(prev => ({
                ...prev,
                [id]: { ...prev[id], isOpen: false }
            }));
        } else {
            // It's a message window
            setClosedMessageIds(prev => new Set(prev).add(id));
        }
    };

    const focusWindow = (id) => {
        // For static windows, we track Z. For messages, we'll use a simple "bring to front" approach or shared state?
        // To simplify, let's keep static windows managed in `windows` state.
        // For dynamic message windows, handling Z-index properly requires merging them into the same state object or a shared Z-manager.
        // For now, let's just update the static ones. Dynamic ones will benefit from being last in DOM usually, but Draggable usually handles z-index on click if 'defaultPosition' is used.
        // Actually, to make 'focus' work properly across ALL windows, they ideally should be in one list.
        // But for this refactor, let's just handle focus for static windows or implement a global counter.

        if (windows[id]) {
            setWindows(prev => {
                const newWindows = { ...prev };
                const maxZ = Math.max(...Object.values(newWindows).map(w => w.zIndex), 10) + 1; // Base 10 to be above messages? No, messages should mix.
                newWindows[id] = { ...newWindows[id], zIndex: maxZ };
                return newWindows;
            });
        }
    };

    const handleVote = async (msgId, type) => {
        const storageKey = `vote_${msgId}`;
        const hasVoted = localStorage.getItem(storageKey);

        if (hasVoted) {
            console.log("Already voted");
            return;
        }

        try {
            const messageRef = doc(db, 'guestbook', msgId);
            await updateDoc(messageRef, {
                [type]: increment(1)
            });
            localStorage.setItem(storageKey, type);
        } catch (error) {
            console.error("Error updating vote:", error);
            // alert("Erro ao votar. Tente novamente.");
        }
    };

    const handleAddMessage = (newMessage) => {
        setMessages(prev => [newMessage, ...prev]);
    };

    const handleLoadMore = () => {
        setMessageLimit(prev => prev + 15);
    };

    // Dynamic Height Measurement
    const bioRef = useRef(null);
    const [bioHeight, setBioHeight] = useState(200); // Default fallback
    const [bioBounds, setBioBounds] = useState(null);

    useEffect(() => {
        if (bioRef.current) {
            // Measure the actual content height including padding if necessary
            const height = bioRef.current.offsetHeight;
            const rect = bioRef.current.closest('.window')?.getBoundingClientRect();
            if (rect) {
                setBioBounds(rect);
            }
            setBioHeight(height);
        }
    }, [isMobile, windows.about.isOpen]);

    // Render Helpers
    const VERTICAL_GAP = 38; // Measured horizontal gap between 'eu' and 'bio' used here vertically
    const X_OFFSET = 50;

    // 1. Top Section (Bio  & Model) - Side by Side
    const TOP_SECTION_Y = 20;

    // We need to know the height of the tallest item in the top section to position the Guestbook below
    // Bio is variable (bioHeight), Model is effectively fixed/visual.
    // Let's assume Model visual height is approx 400px (based on other code) or we use the measured bioHeight if it's taller.
    // Looking at previous code, MODEL was placed below Bio. Now they are neighbors.
    // Let's estimate Model window height ~400-500px based on existing usage.
    const MODEL_WINDOW_HEIGHT_ESTIMATE = 450;
    const TOP_SECTION_HEIGHT = Math.max(bioHeight, MODEL_WINDOW_HEIGHT_ESTIMATE);

    // 2. Guestbook Window
    // Position below the Bio window specifically, anchored to its height
    // We use bioHeight + approx 40px for window header/padding if bioBounds isn't ready,
    // but bioBounds is better once measured.
    const BIO_TOTAL_HEIGHT = bioBounds ? bioBounds.height : (bioHeight + 45);
    const GUESTBOOK_TOP = TOP_SECTION_Y + BIO_TOTAL_HEIGHT + VERTICAL_GAP;
    const GUESTBOOK_HEIGHT = 520; // Fixed form height

    // 3. Messages Start
    const MSG_START_TOP = GUESTBOOK_TOP + GUESTBOOK_HEIGHT + VERTICAL_GAP;

    // Dynamic Messages Height
    const msgContainerRef = useRef(null);
    const [messagesHeight, setMessagesHeight] = useState(0);

    useEffect(() => {
        if (msgContainerRef.current) {
            setMessagesHeight(msgContainerRef.current.offsetHeight);
        }
    }, [messages, isMobile, closedMessageIds]); // Recalculate when messages change

    const showLoadMore = messages.length >= messageLimit;
    const FOOTER_PADDING = showLoadMore ? 100 : 20; // 100px if button visible, 20px if not
    const totalPageHeight = isMobile ? 'auto' : `${MSG_START_TOP + messagesHeight + FOOTER_PADDING}px`;


    return (
        <Wrapper id="home-wrapper" style={{ minHeight: totalPageHeight }}>

            {/* 1. Bio Window (Right Side) */}
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
                        // Desktop: Right side aligned to container edge
                        left: isMobile ? 0 : 'auto',
                        right: isMobile ? 0 : 0,
                        margin: isMobile ? '0 auto' : 0,
                        width: 'fit-content',
                        top: isMobile ? 0 : `${TOP_SECTION_Y}px`,
                    }}
                >
                    <div ref={bioRef} style={{ width: '100%' }}>
                        {windows.about.content}
                    </div>
                </DraggableWindow>
            )}

            {/* 2. 3D Model Window (Left Side) */}
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
                        // Desktop: Left side aligned to container edge
                        left: isMobile ? 0 : 0,
                        right: isMobile ? 0 : 'auto',
                        margin: isMobile ? '0 auto' : 0,
                        width: 'fit-content',
                        top: isMobile ? 0 : `${TOP_SECTION_Y}px`,
                    }}
                    windowStyle={{ width: '100%', maxWidth: '500px' }}
                >
                    <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Carregando modelo...</div>}>
                        {windows.model.content}
                    </Suspense>
                </DraggableWindow>
            )}

            {/* 3. Guestbook FORM Window (Centered Below) */}
            {windows.guestbook.isOpen && (
                <div id="guestbook-window" style={{
                    position: isMobile ? 'relative' : 'absolute',
                    left: isMobile ? 0 : '50%',
                    right: isMobile ? 0 : 'auto',
                    margin: isMobile ? '0 auto' : 0,
                    transform: isMobile ? 'none' : `translateX(calc(-50% + ${X_OFFSET}px))`,
                    width: 'fit-content',
                    top: isMobile ? 0 : `${GUESTBOOK_TOP}px`,
                    zIndex: windows.guestbook.zIndex,
                }}>
                    <DraggableWindow
                        id="guestbook"
                        title={windows.guestbook.title}
                        onClose={closeWindow}
                        onFocus={focusWindow}
                        isMobile={isMobile}
                        windowStyle={{ width: '350px', height: '520px' }} // Fixed dimensions
                    >
                        <GuestbookWindow onAddMessage={handleAddMessage} />
                    </DraggableWindow>
                </div>
            )}

            {/* 4. Dynamic Message Windows Container */}
            <div
                ref={msgContainerRef}
                style={{
                    position: isMobile ? 'relative' : 'absolute',
                    top: isMobile ? 0 : `${MSG_START_TOP}px`,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px', // Consistent gap between messages
                    pointerEvents: 'none' // Allow clicking through the container area
                }}>
                {messages.map((msg, index) => {
                    if (closedMessageIds.has(msg.id)) return null;

                    return (
                        <div key={msg.id} style={{ pointerEvents: 'auto' }}> {/* Restore pointer events for windows */}
                            <MessageWindow
                                msg={msg}
                                onClose={closeWindow}
                                onFocus={() => { }}
                                isMobile={isMobile}
                                index={index}
                                totalMessages={messages.length}
                                onVote={handleVote}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Load More Button */}
            {
                !isMobile && messages.length >= messageLimit && (
                    <div style={{ position: 'absolute', bottom: '50px', left: 0, right: 0, textAlign: 'center' }}>
                        <Button onClick={handleLoadMore} style={{ fontWeight: 'bold' }}>
                            Carregar Mais...
                        </Button>
                    </div>
                )
            }

            {/* Mobile Load More (Static flow) */}
            {
                isMobile && messages.length >= messageLimit && (
                    <div style={{ margin: '20px 0' }}>
                        <Button onClick={handleLoadMore}>
                            Carregar Mais...
                        </Button>
                    </div>
                )
            }

            {/* Reset Button if all static closed */}
            {
                !windows.model.isOpen && !windows.about.isOpen && !windows.guestbook.isOpen && (
                    <div style={{ textAlign: 'center', marginTop: '100px', color: 'gray', width: '100%' }}>
                        <p>Sistema encerrado.</p>
                        <Button onClick={() => window.location.reload()}>Reiniciar</Button>
                    </div>
                )
            }
        </Wrapper >
    );
};
export default Home;
