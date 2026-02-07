
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { fetchJsonFromStorage, getStorageUrl } from '../utils/storageLoader';
import FirebaseMedia from './FirebaseMedia';

// --- Styled Components (Dark Mode) ---

const Container = styled.div`
  background-color: #000;
  min-height: 100vh;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 935px; /* Instagram web max width */
  padding: 30px 20px 0;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 736px) {
    padding: 0;
    width: 100%;
  }
`;

// --- Profile Header ---

const ProfileHeader = styled.header`
  display: flex;
  margin-bottom: 20px;
  align-items: center; /* Vertically center content with profile pic */
  
  @media (max-width: 736px) {
    padding: 14px;
    margin-bottom: 0;
    /* Removed border-bottom for better cohesion */
  }
`;

const ProfilePicContainer = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  margin-right: 30px;
  display: flex;
  justify-content: center;
  
  @media (max-width: 736px) {
    flex-grow: 0;
    margin-right: 20px;
  }
`;

const ProfileImage = styled(FirebaseMedia)`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #363636;
  
  @media (max-width: 736px) {
    width: 77px;
    height: 77px;
  }
`;

const ProfileInfo = styled.section`
  flex-grow: 2;
  flex-basis: 30px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Ensure content is centered if height matches image */
  
   @media (max-width: 736px) {
     flex-grow: 1;
   }
`;

const UsernameRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  flex-wrap: wrap;
  gap: 20px;
  
  h2 {
    font-size: 24px;
    font-weight: 700;
    line-height: 30px;
    margin: 0;
  }
`;

const StatsRow = styled.ul`
  display: flex;
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  font-size: 14px;
  
  li {
    margin-right: 20px;
  }
  
  strong {
    font-weight: 600;
  }
  
  @media (max-width: 736px) {
     display: none;
  }
`;

const MobileStatsRow = styled.div`
  display: none;
  margin-bottom: 12px;
  
  @media (max-width: 736px) {
    display: flex;
    justify-content: flex-start;
    gap: 24px;
    width: auto;
  }
`;

const MobileStatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  
  span:first-child {
    font-weight: 700;
    font-size: 16px;
    color: #fff;
    line-height: 1.2;
  }
  
  span:last-child {
    font-size: 14px;
    color: #fff;
    font-weight: 400;
  }
`;

const NameSection = styled.div`
  font-size: 14px;
  margin-bottom: 12px;
  
  h1 {
    font-weight: 400;
    font-size: 14px;
    margin: 0;
  }
`;

const BioSection = styled.div`
  font-size: 14px;
  white-space: normal;
  line-height: 18px;
  color: #fff;
`;

// --- Navigation Tabs ---

const TabsContainer = styled.div`
  border-top: 1px solid #262626;
  display: flex;
  justify-content: center;
  gap: 60px;
  margin-bottom: 5px; /* small gap before grid */
  
  @media (max-width: 736px) {
    gap: 0;
    justify-content: space-around;
    margin-bottom: 0;
    border-bottom: 1px solid #262626; /* Add bottom border for cohesion */
  }
`;

const TabItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  height: 52px;
  cursor: pointer;
  color: ${props => props.$active ? '#fff' : '#8e8e8e'};
  border-top: 1px solid ${props => props.$active ? '#fff' : 'transparent'};
  margin-top: -1px; /* Overlap border */
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  
  &:hover {
    color: #fff;
  }
  
  span {
    display: block;
  }
  
  @media (max-width: 736px) {
     span { display: none; } /* often hide text on mobile or just show icons */
     height: 44px; /* Narrower on mobile */
  }
`;

// SVG Icons
const GridIcon = () => (
  <svg aria-label="" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <rect fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" width="18" x="3" y="3"></rect>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="9.015" x2="9.015" y1="3" y2="21"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="14.985" x2="14.985" y1="3" y2="21"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="9.015" y2="9.015"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14.985" y2="14.985"></line>
  </svg>
);

const ReelsIcon = () => (
  <svg aria-label="" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <line fill="none" stroke="currentColor" strokeLinejoin="round" strokeWidth="2" x1="2.049" x2="21.95" y1="7.002" y2="7.002"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="13.504" x2="16.362" y1="2.001" y2="7.002"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="7.207" x2="10.002" y1="2.11" y2="7.002"></line>
    <path d="M2 12.001v3.449c0 2.849.698 4.006 1.606 4.945.94.908 2.098 1.607 4.946 1.607h6.896c2.848 0 4.006-.699 4.946-1.607.908-.939 1.606-2.096 1.606-4.945V8.552c0-2.848-.698-4.006-1.606-4.945C19.454 2.699 18.296 2 15.448 2H8.552c-2.848 0-4.006.699-4.946 1.607C2.698 4.546 2 5.704 2 8.552Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
);

const TaggedIcon = () => (
  <svg aria-label="" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <path d="M10.201 3.797 12 1.997l1.799 1.8a1.59 1.59 0 0 0 1.124.465h5.259A1.818 1.818 0 0 1 22 6.08v14.104a1.818 1.818 0 0 1-1.818 1.818H3.818A1.818 1.818 0 0 1 2 20.184V6.08a1.818 1.818 0 0 1 1.818-1.818h5.26a1.59 1.59 0 0 0 1.123-.465Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    <path d="M18.598 22.002V21.4a3.949 3.949 0 0 0-3.948-3.949H9.495A3.949 3.949 0 0 0 5.546 21.4v.603" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
    <circle cx="12.072" cy="11.075" fill="none" r="3.556" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
  </svg>
);

const FeedListIcon = () => (
  <svg aria-label="" color="currentColor" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="10" y2="10"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="6" y2="6"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="14" y2="14"></line>
    <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="21" x2="3" y1="18" y2="18"></line>
  </svg>
);

// --- Stories Row ---

const StoriesContainer = styled.div`
  display: flex;
  padding: 20px;
  overflow-x: auto;
  gap: 30px;
  margin-bottom: 20px;
  
  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
  
  @media (max-width: 736px) {
      padding: 10px 0; /* Symmetric Top/Bottom padding */
      justify-content: center;
  }
`;

const StoryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  min-width: 85px; /* Ensure space for ring (77px) + padding/border without cutting */
  padding: 5px; /* Add padding to item to prevent hover effects or rings from touching edges */
  
  @media (max-width: 736px) {
    gap: 12px; /* Increased gap */
    padding: 0 5px; /* Remove vertical padding, rely on container */
  }
`;

const StoryPreviewRing = styled.div`
  width: 77px;
  height: 77px;
  border-radius: 50%;
  padding: 3px;
  background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StoryPreviewImg = styled(FirebaseMedia)`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid #000;
  object-fit: cover;
`;

const StoryLabel = styled.span`
  font-size: 12px;
  color: #fff;
  text-align: center;
  max-width: 80px;
  line-height: 1.2;
`;

// --- Grid View ---

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px; /* classic instagram gap usually small */
  padding-bottom: 50px;
  width: 100%;
`;

const GridItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%; /* Square Aspect Ratio */
  background-color: #262626;
  cursor: pointer;
  overflow: hidden;
  
  img, video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: opacity 0.2s;
  }
  
  &:hover img {
    opacity: 0.8;
  }

  /* Multi-post indicator icon could go here */
`;

const ReelsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns like grid */
  gap: 4px;
  padding-bottom: 50px;
  width: 100%;
`;

const ReelsItem = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 177%; /* ~9:16 Aspect Ratio (16/9 = 1.777) */
  background-color: #262626;
  cursor: pointer;
  overflow: hidden;

  video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  /* Icon indicating it's a reel? */
`;

// --- Feed View Styles (reused/adapted) ---

const FeedWrapper = styled.div`
    width: 100%;
    max-width: 470px;
    margin: 0 auto;
    padding-top: 20px;

    @media (max-width: 736px) {
      padding-top: 0; /* Remove padding to match tab bottom symmetry */
    }
`;

const PostCard = styled.div`
  background: #000;
  border: 1px solid #262626;
  border-radius: 8px;
  margin-bottom: 24px;
  color: #fff;
`;

const PostHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 14px;
`;

const FeedProfileRing = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  padding: 3px;
  background: ${props => props.$hasStories ? 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  cursor: ${props => props.$hasStories ? 'pointer' : 'default'};
`;

const SmallProfilePic = styled(FirebaseMedia)`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: ${props => props.$hasStories ? '2px solid #000' : 'none'};
    object-fit: cover;
`;

const PostContent = styled.div`
  width: 100%;
  position: relative;
  background-color: #000;
  min-height: 300px;
  overflow: hidden;

  &:hover button {
    opacity: 1;
  }
`;

const MediaTrack = styled.div`
  display: flex;
  transition: transform 0.3s ease-in-out;
  transform: translateX(${props => -(props.$index * 100)}%);
  width: 100%;
  height: 100%;
  flex: 1; /* Ensure track occupies available space */
`;

const MediaItem = styled.div`
  min-width: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;

  /* img, video selector removed from styled component to allow FirebaseMedia */
  /* We will style FirebaseMedia via props or nested styles if needed */
  & > * {
    width: 100%;
    height: 100%;
    display: block;
    max-height: 100%; 
    object-fit: contain;
  }
`;

const PostFooter = styled.div`
  padding: 12px 14px;
`;

const BackButton = styled.button`
    background: transparent;
    border: none;
    color: #fff;
    font-size: 16px;
    padding: 10px;
    cursor: pointer;
    align-self: flex-start;
    
    &:before {
        content: '← ';
    }
`;

const CarouselZone = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 20%;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  ${props => props.$left ? 'left: 0;' : 'right: 0;'}
`;


// --- Lightbox & Utilities ---
// (Reusing Lightbox styles from previous iteration but ensuring dark mode compatibility)

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh; /* Dynamic viewport height to account for mobile bars */
  background: rgba(0, 0, 0, 0.95); /* Slightly darker/more immersive */
  z-index: 6000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// ... (Other lightbox styles can remain similar, just ensuring colors work)
const CloseButton = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  color: white;
  font-size: 24px;
  z-index: 20;
  cursor: pointer;
  font-weight: bold;
`;

const StoryProgress = styled.div`
  position: absolute;
  top: max(10px, env(safe-area-inset-top)); /* Respect notch */
  left: 0;
  width: 100%;
  padding: 0 5px;
  display: flex;
  gap: 3px;
  z-index: 10;
`;

const ProgressBar = styled.div`
  height: 2px;
  flex: 1;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
  
  div {
    height: 100%;
    background: #fff;
    transition: width 0.1s linear;
  }
`;

const StoryMedia = styled.div`
  width: 100%;
  height: 100%;
  img, video {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const TapZone = styled.div`
  position: absolute;
  top: 0;
  height: 100%;
  width: 50%;
  z-index: 5;
  cursor: pointer;
  ${props => props.$left ? 'left: 0;' : 'right: 0;'}
`;

const TopGradient = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%);
  z-index: 10;
  z-index: 10;
  pointer-events: none;
`;

const BottomGradient = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 150px;
  background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
  z-index: 10;
  pointer-events: none;
`;

const ReelCaptionOverlay = styled.div`
  position: absolute;
  bottom: 20px;
  left: 0;
  width: 100%;
  padding: 0 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ReelCaptionText = styled.div`
  color: #fff;
  font-size: 14px;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  white-space: pre-wrap;
  
  span {
    font-weight: 600;
    margin-right: 8px;
  }
`;

const StoryViewerHeader = styled.div`
  position: absolute;
  top: calc(max(10px, env(safe-area-inset-top)) + 15px); /* Position below progress bar with safe area */
  left: 0;
  width: 100%;
  padding: 0 16px;
  display: flex;
  align-items: center;
  z-index: 20;
  color: #fff;
`;

const StoryHeaderProfile = styled(FirebaseMedia)`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StoryHeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const StoryHeaderUsername = styled.span`
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
`;

const StoryHeaderTime = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 2px;
`;

const StoryCloseButton = styled.div`
  cursor: pointer;
  padding: 8px;
  margin-right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    filter: drop-shadow(0 0 2px rgba(0,0,0,0.5));
  }
`;

const StoryNavButton = styled.button`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 60px;
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 15;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
  ${props => props.$left ? 'left: 0;' : 'right: 0;'}
  
  &:after {
    content: '${props => props.$left ? '<' : '>'}';
    background: rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #000;
    font-weight: bold;
    font-family: Arial, sans-serif;
    font-size: 14px;
    box-shadow: 0 0 5px rgba(0,0,0,0.3);
  }

  &:hover:after {
    background: #fff;
  }
`;

// Slide Transition Styles
const FullScreenMobileMedia = `
  @media (max-width: 736px) {
    padding: 0;
  }
`;

const SlideContainer = styled.div`
  width: 100%;
  max-width: 400px;
  height: 100dvh; /* Dynamic viewport height */
  position: relative;
  overflow: hidden;
  
  @media (max-width: 736px) {
    max-width: 100%;
  }
`;

// --- Styled Components for Stories ---

const DaysTrack = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  transition: ${props => props.$animating ? 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none'};
  transform: translateX(${props => -(props.$offset * 100)}%);
`;

const DayItem = styled.div`
  min-width: 100%;
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  display: flex;
  justify-content: center;
`;

const StoryContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: transparent;
  display: flex;
  justify-content: center;
`;

const StoryInner = styled.div`
  position: relative;
  height: 100%;
  aspect-ratio: 9/16;
  background: #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// --- Helper Functions ---

const getAssetUrl = (uri) => uri;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000;
  if (diff < 60) return 'Agora';
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} d`;
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });
};

const decodeHtml = (html) => {
  if (!html) return '';
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// --- StoryViewer Component ---

const StoryViewer = ({ initialDate, storyDates, stories, onClose, profilePic, singleDayMode = false }) => {
  const [dateIndex, setDateIndex] = useState(storyDates.indexOf(initialDate));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [slideOffset, setSlideOffset] = useState(storyDates.indexOf(initialDate));
  const [transitionTarget, setTransitionTarget] = useState(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const controlsTimeoutRef = useRef(null);
  const [isMediaLoaded, setIsMediaLoaded] = useState(false);
  const videoRef = useRef(null);

  // --- Pull-to-Close Logic ---
  const containerRef = useRef(null);
  const touchStartY = useRef(null);

  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    if (containerRef.current) containerRef.current.style.transition = 'none';
    setIsPaused(true);
    if (videoRef.current) videoRef.current.pause();
  };

  const onTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    // Only drag down
    if (deltaY > 0 && containerRef.current) {
      containerRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (deltaY > 150) {
      onClose();
    } else {
      setIsPaused(false);
      // Resume video if it's the current media
      if (videoRef.current) videoRef.current.play();

      if (containerRef.current) {
        // Reset
        containerRef.current.style.transition = 'transform 0.3s ease-out';
        containerRef.current.style.transform = '';
      }
    }
    touchStartY.current = null;
  };

  const activeDate = storyDates[dateIndex];
  const dayStories = [...(stories[activeDate] || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
  const currentStory = dayStories[currentIndex];

  const triggerDayTransition = React.useCallback((targetIdx, direction) => {
    if (animating) return;
    setTransitionTarget(targetIdx);
    setAnimating(true);
    setSlideOffset(targetIdx);
    setTimeout(() => {
      setDateIndex(targetIdx);
      setCurrentIndex(direction === 'next' ? 0 : (stories[storyDates[targetIdx]].length - 1));
      setAnimating(false);
      setTransitionTarget(null);
    }, 400);
  }, [animating, stories, storyDates]);

  const nextStory = React.useCallback(() => {
    if (animating) return;
    if (currentIndex < dayStories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      if (!singleDayMode && dateIndex < storyDates.length - 1) {
        triggerDayTransition(dateIndex + 1, 'next');
      } else {
        onClose();
      }
    }
  }, [animating, currentIndex, dayStories.length, dateIndex, storyDates, triggerDayTransition, onClose, singleDayMode]);

  const prevStory = React.useCallback(() => {
    if (animating) return;
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      if (!singleDayMode && dateIndex > 0) {
        triggerDayTransition(dateIndex - 1, 'prev');
      }
    }
  }, [animating, currentIndex, dateIndex, triggerDayTransition, singleDayMode]);

  const resetControlsTimeout = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => { setControlsVisible(false); }, 3000);
  };

  useEffect(() => { resetControlsTimeout(); return () => { if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current); }; }, [currentIndex, dateIndex]);
  useEffect(() => { setIsMediaLoaded(false); }, [currentIndex, dateIndex]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextStory();
      if (e.key === 'ArrowLeft') prevStory();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextStory, prevStory, onClose]);

  // Auto-advance and Progress animation
  useEffect(() => {
    if (animating || !currentStory || !activeDate || !isMediaLoaded || isPaused) return;
    setProgress(0);

    if (currentStory.media?.[0]?.type === 'video') return;

    const duration = 5000;
    const intervalTime = 50;
    const increment = (intervalTime / duration) * 100;

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProgress(100);
        nextStory();
      } else {
        setProgress(currentProgress);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [animating, currentStory?.date, activeDate, nextStory, isMediaLoaded, isPaused]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(p);
    }
  };

  if (!currentStory) return null;

  const renderStoryContent = (idx, dayDate, isTransitionSide = false) => {
    const dStories = [...(stories[dayDate] || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
    const story = dStories[idx] || dStories[0];
    if (!story) return null;
    const storyDate = new Date(story.date);
    const dateLabel = storyDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
    const timeLabel = storyDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
    const storyData = story.media && story.media[0] ? story.media[0] : null;
    if (!storyData) return null;

    return (
      <StoryContainer>
        <StoryInner>
          <TopGradient />
          <StoryViewerHeader>
            <StoryHeaderProfile path={profilePic} />
            <StoryHeaderInfo>
              <StoryHeaderUsername>matheusdodia</StoryHeaderUsername>
              <StoryHeaderTime>{dateLabel} • {timeLabel}</StoryHeaderTime>
            </StoryHeaderInfo>
            <StoryCloseButton onClick={onClose}>
              <svg aria-label="Fechar" color="#ffffff" fill="#ffffff" height="18" role="img" viewBox="0 0 24 24" width="18">
                <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
                <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
              </svg>
            </StoryCloseButton>
          </StoryViewerHeader>
          <StoryProgress>
            {dStories.map((s, i) => {
              const isActive = !animating && i === idx && dayDate === activeDate;
              const isSeen = isTransitionSide ? (transitionTarget > dateIndex ? false : true) : (dayDate === activeDate ? i < idx : (transitionTarget > dateIndex ? true : false));
              const currentProgress = isActive ? progress : (isSeen ? 100 : 0);
              return (
                <ProgressBar key={i}>
                  <div style={{ width: `${currentProgress}%` }} />
                </ProgressBar>
              );
            })}
          </StoryProgress>
          <StoryMedia onMouseMove={resetControlsTimeout}>
            <FirebaseMedia
              key={storyData.uri}
              path={storyData.uri}
              type={storyData.type}
              alt="story"
              ref={isTransitionSide ? null : videoRef}
              autoPlay={!isTransitionSide}
              playsInline
              muted={animating || isTransitionSide}
              onTimeUpdate={isTransitionSide ? null : handleVideoTimeUpdate}
              onEnded={isTransitionSide ? null : nextStory}
              onLoad={() => !isTransitionSide && setIsMediaLoaded(true)}
              onLoadedData={() => !isTransitionSide && setIsMediaLoaded(true)}
              onError={() => !isTransitionSide && setIsMediaLoaded(true)}
              onClick={(e) => e.stopPropagation()}
              objectFit="contain"
              showPlaceholder={false}
            />
          </StoryMedia>
          {!isMediaLoaded && !isTransitionSide && (
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 50 }}>
              <div style={{ color: 'white' }}>Carregando...</div>
            </div>
          )}
        </StoryInner>
        {!animating && !isTransitionSide && (
          <>
            <StoryNavButton $left $visible={controlsVisible} onClick={prevStory} title="Anterior" />
            <StoryNavButton $visible={controlsVisible} onClick={nextStory} title="Próximo" />
            <TapZone $left onClick={prevStory} />
            <TapZone onClick={nextStory} />
          </>
        )}
      </StoryContainer>
    );
  };

  return (
    <LightboxOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SlideContainer
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <DaysTrack $animating={animating} $offset={slideOffset}>
          {storyDates.map((date, idx) => {
            const isCurrent = idx === dateIndex;
            const isTarget = idx === transitionTarget;
            const isNeighbor = Math.abs(idx - dateIndex) === 1;
            if (!isCurrent && !isTarget && !isNeighbor) return <DayItem key={date} />;
            return (
              <DayItem key={date}>
                {renderStoryContent(idx === dateIndex ? currentIndex : (idx < dateIndex ? stories[date].length - 1 : 0), date, !isCurrent)}
              </DayItem>
            );
          })}
        </DaysTrack>
      </SlideContainer>
    </LightboxOverlay>
  );
};

// --- ReelViewer Component (Mobile Fullscreen) ---

const ReelViewer = ({ reel, onClose, profilePic }) => {
  if (!reel) return null;
  const reelDate = new Date(reel.date);
  const dateLabel = reelDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const [isMuted, setIsMuted] = useState(false); // Default unmuted or auto? Instagram usually starts muted but let's assume unmuted for "toggle" logic request
  const videoRef = useRef(null);

  // --- Pull-to-Close & Tap Logic ---
  const containerRef = useRef(null);
  const touchStartY = useRef(null);
  const touchStartTime = useRef(null);
  const isDragging = useRef(false);

  const onTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
    isDragging.current = false;

    if (containerRef.current) containerRef.current.style.transition = 'none';

    // Pause on hold
    if (videoRef.current) videoRef.current.pause();
  };

  const onTouchMove = (e) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;

    if (Math.abs(deltaY) > 10) isDragging.current = true; // Threshold for "drag" vs "static hold"

    if (deltaY > 0 && containerRef.current) {
      containerRef.current.style.transform = `translateY(${deltaY}px)`;
    }
  };

  const onTouchEnd = (e) => {
    if (touchStartY.current === null) return;
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    const touchDuration = Date.now() - touchStartTime.current;

    // Resume video
    if (videoRef.current) videoRef.current.play();

    if (deltaY > 150) {
      onClose();
    } else {
      // Logic for Tap vs Hold
      // If duration < 200ms and didn't drag -> Tap -> Toggle Mute
      if (touchDuration < 200 && !isDragging.current) {
        setIsMuted(prev => !prev);
      }

      if (containerRef.current) {
        containerRef.current.style.transition = 'transform 0.3s ease-out';
        containerRef.current.style.transform = '';
      }
    }
    touchStartY.current = null;
  };

  // Reuse story styled components for consistency
  return (
    <LightboxOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <SlideContainer
        ref={containerRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <StoryContainer>
          <StoryInner>
            <TopGradient />
            <BottomGradient />

            {/* Top Header - User Info */}
            <StoryViewerHeader>
              <StoryHeaderProfile path={profilePic} />
              <StoryHeaderInfo>
                <StoryHeaderUsername>matheusdodia</StoryHeaderUsername>
                <StoryHeaderTime>{dateLabel}</StoryHeaderTime>
              </StoryHeaderInfo>
              <StoryCloseButton onClick={onClose}>
                <svg aria-label="Fechar" color="#ffffff" fill="#ffffff" height="18" role="img" viewBox="0 0 24 24" width="18">
                  <polyline fill="none" points="20.643 3.357 12 12 3.353 20.647" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3"></polyline>
                  <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" x1="20.649" x2="3.354" y1="20.649" y2="3.354"></line>
                </svg>
              </StoryCloseButton>
            </StoryViewerHeader>

            {/* Video Content */}
            <StoryMedia>
              <FirebaseMedia
                path={reel.media[0].uri}
                type="video"
                alt="Reel"
                ref={videoRef}
                autoPlay
                playsInline
                loop
                muted={isMuted}
                controls={false}
                objectFit="cover"
                showPlaceholder={true}
                onClick={(e) => e.stopPropagation()}
              />
            </StoryMedia>

            {/* Muted Indicator (Optional but helpful) */}
            {isMuted && (
              <div style={{
                position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                zIndex: 30, background: 'rgba(0,0,0,0.6)', borderRadius: '50%', padding: '15px', pointerEvents: 'none', display: 'flex'
              }}>
                <svg aria-label="Som desativado" color="#ffffff" fill="#ffffff" height="30" role="img" viewBox="0 0 24 24" width="30">
                  <path d="M16.636 7.364a1 1 0 0 0-1.414 1.414L18.586 12l-3.364 3.222a1 1 0 1 0 1.414 1.414L20 13.414l3.364 3.222a1 1 0 0 0 1.414-1.414L21.414 12l3.364-3.222a1 1 0 0 0-1.414-1.414L20 10.586l-3.364-3.222Z" transform="translate(-16 -7)"></path>
                  <path d="M.907 3.03 2.32 1.616l20.457 20.456-1.414 1.414L15.399 17.52l-.001-.001-3.619 3.619L11.78 21.138A1.9 1.9 0 0 1 11.138 21H5.862a1.9 1.9 0 0 1-.641-.138L1.78 19.138A1.9 1.9 0 0 1 1.138 19V5a1.9 1.9 0 0 1 .641-1.362L4.01 1.411 2.923.324.793 2.454.907 3.03Zm5.594 15.97h4.088l5.962-5.962-2.13-2.128-2.696-2.696L3 3.396V19a.214.214 0 0 0 .158.058l1.78 1.78a.214.214 0 0 0 .058.158l.641.138.16.036ZM16 7.604V5.042l-5.656 5.656 2.052 2.052L16 7.604ZM18.257 10.743l1.838 1.839a8.03 8.03 0 0 0 0-3.678l-1.838 1.839Z"></path>
                  <path d="M1.385 5.564 3.35 7.528V19a1 1 0 0 0 1 1h4.5a1 1 0 0 0 .707-.293L15.414 13.85a1 1 0 0 0 .293-.707V8.586L18.818 11.69a6.002 6.002 0 0 0 0-4.38l1.64-1.64a8.006 8.006 0 0 1 0 7.66l1.414 1.414a10.008 10.008 0 0 0 0-10.488l-2.074 2.074Z" fill="none"></path>
                </svg>
                {/* Fallback to simple speaker-x if vector is complex. Let's use a simpler known path for mute. */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg aria-label="Som desativado" color="#ffffff" fill="#ffffff" height="24" role="img" viewBox="0 0 24 24" width="24">
                    <path d="M1.63 21.325C1.84 21.536 2.115 21.64 2.39 21.64c.277 0 .553-.105.764-.316l18.524-18.522c.421-.423.421-1.107-.001-1.529s-1.107-.421-1.529.001L1.624 19.797c-.42.422-.42 1.106.006 1.528zm21.583-9.283c-.004 0-.008 0-.012.001-.456.027-.84.343-.95.787-.669 2.684-2.618 4.81-5.188 5.688-.57.195-.873.813-.678 1.383.194.57.81.876 1.383.678 3.109-1.062 5.467-3.633 6.275-6.88.134-.535-.192-1.092-.716-1.246-.038-.01-.077-.012-.114-.012zm-3.327-4.17c-1.897-1.391-4.228-2.012-6.526-1.742l1.608 1.608c1.397.02 2.76.623 3.864 1.831.399.437 1.074.464 1.511.065.437-.399.463-1.073.064-1.51-.157-.172-.332-.334-.521-.452zm-3.79 8.274l-3.322-3.322c-.22-.22-.508-.344-.816-.344H6.5c-.322 0-.63.15-.826.402l-3.235 4.16c-.114.147-.177.327-.177.513v2.857c0 .461.374.835.835.835h5.5l5.242 4.135c.144.114.321.171.498.171.186 0 .371-.063.518-.186.286-.24.45-.595.45-.969v-4.908c-.001-.58-.235-1.137-.638-1.545zm3.14-8.77l.006-.008c.399-.434 1.071-.462 1.506-.065.434.397.464 1.067.07 1.503-.004.004-.008.009-.012.013L19.24 7.37zM11.336 2.378L6.442 6.239 8.36 8.157l2.977-2.348v3.91l1.663 1.663V3.347c0-.374-.165-.729-.451-.969-.296-.248-.707-.311-1.063-.122l-.15.122z"></path>
                  </svg>
                </div>
              </div>
            )}

            {/* Bottom Caption */}
            <ReelCaptionOverlay>
              <ReelCaptionText>
                {decodeHtml(reel.description)}
              </ReelCaptionText>
            </ReelCaptionOverlay>

          </StoryInner>
        </StoryContainer>
      </SlideContainer>
    </LightboxOverlay>
  );
};

// --- Post Modal (Lightbox) Styles ---

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5000;
  padding: 20px;
  
  ${FullScreenMobileMedia}
`;

// ... NavButton ...

const NavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  opacity: 0.8;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  ${props => props.$left ? 'left: 10px;' : 'right: 10px;'}
  
  &:hover {
    opacity: 1;
    transform: translateY(-50%) scale(1.1);
  }

  &:after {
    content: '';
    width: 8px;
    height: 8px;
    border-top: 2px solid #000;
    border-right: 2px solid #000;
    transform: ${props => props.$left ? 'rotate(-135deg)' : 'rotate(45deg)'};
    margin-${props => props.$left ? 'left' : 'right'}: ${props => props.$left ? '2px' : '-2px'};
  }

  @media (max-width: 736px) {
    width: 28px;
    height: 28px;
  }

  ${FullScreenMobileMedia}
`;

const ModalContainer = styled.div`
  display: flex;
  width: auto;
  max-width: 1200px;
  height: 90vh; 
  max-height: 900px;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  position: relative;
  
  /* Reels now use standard logic (max-width 1200px, flex layout) */

  @media (max-width: 736px) {
    flex-direction: column;
    height: 100%;
    max-height: 100%;
    width: 100%;
    border-radius: 0;
    padding: 0;
    justify-content: center;
  }
`;

const ModalMediaSection = styled.div`
  background-color: #000;
  display: flex;
  position: relative;
  height: 100%;
  overflow: hidden;
  flex: 1; 
  min-width: 300px;
  justify-content: center;
  align-items: center;
  
  /* Standard aspect ratio logic for Posts, but for Reels/Video we let it fit/letterbox naturally in the flex space */
  ${props => props.aspectRatio && !props.$isReel && `
    aspect-ratio: ${props.aspectRatio};
    flex: 0 1 auto;
    width: auto;
  `}

  &:hover ${NavButton} {
    opacity: 1;
  }

  @media (max-width: 736px) {
    height: ${props => props.$isReel ? '100%' : '60vh'};
    width: 100%;
    aspect-ratio: auto;
    flex: 1; /* Ensure it takes available space on mobile */
  }
`;

// ... ModalMediaImage, ModalMediaVideo ...

const ModalInfoSection = styled.div`
  width: 400px;
  min-width: 400px;
  background-color: #262626;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #262626;
  
  @media (max-width: 1000px) {
     width: 350px;
     min-width: 350px;
  }

  @media (max-width: 736px) {
    width: 100%;
    min-width: 100%;
    border-left: none;
    height: auto;
    /* On mobile, if we want full screen media, we might hide info or stack it.
       For Reels Full Screen, we usually hide this or overlay it.
       If user wants "Full Screen", hiding sidebar on mobile is correct for Reels. 
       But for regular posts it stacks. */
    display: ${props => props.$isReel ? 'none' : 'flex'}; 
    /* Allowing content to flow */
    flex: 1; 
  }
`;

const ModalHeader = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid #363636;
  display: flex;
  align-items: center;
  color: #fff;
  flex-shrink: 0;
  gap: 12px;
  background-color: #262626;
  width: 100%;
`;

const SmallAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const ModalUsername = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #fff;
`;

const ModalMainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  color: #fff;
  font-size: 14px;
    
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: #262626;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #555;
    border-radius: 4px;
    border: 2px solid #262626;
  }
`;

const CommentRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  align-items: flex-start;
`;

const CommentText = styled.div`
  flex: 1;
  white-space: pre-wrap;
  line-height: 1.4;
  
  span {
    font-weight: 600;
    margin-right: 6px;
  }
`;



const ActionIcons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
  svg {
    cursor: pointer;
    &:hover { opacity: 0.7; }
  }
`;

const ModalDate = styled.div`
  font-size: 12px;
  color: #a8a8a8;
  text-transform: uppercase;
  margin-bottom: 12px;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 30px;
  cursor: pointer;
  z-index: 5001;
  padding: 8px;
  line-height: 1;
  
  &:hover {
    opacity: 0.8;
  }
`;



const InstagramPostModal = ({ post, allPosts, onClose, onNavigate, profilePic, stories, onProfileClick }) => {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(null);
  const isReel = post.type === 'reel';

  // State to handle post transition animation (simple for now)
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleMediaLoad = (e) => {
    let width, height;
    if (e.target.tagName === 'VIDEO') {
      width = e.target.videoWidth;
      height = e.target.videoHeight;
    } else {
      width = e.target.naturalWidth;
      height = e.target.naturalHeight;
    }
    if (width && height) {
      setAspectRatio(width / height);
    }
  };

  useEffect(() => {
    if (isReel) {
      setAspectRatio(9 / 16);
    } else {
      setAspectRatio(null);
    }
    setMediaIndex(0);
    setIsTransitioning(false);
  }, [post.id, post.uri, isReel]);

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!post) return null;

  const postIndex = allPosts ? allPosts.findIndex(p => (p.id && p.id === post.id) || (p.date === post.date && p.description === post.description)) : -1;
  const hasMultipleMedia = post.media && post.media.length > 1;
  const hasNextPost = allPosts && postIndex < allPosts.length - 1;
  const hasPrevPost = allPosts && postIndex > 0;

  const handleNextMedia = (e) => {
    e?.stopPropagation();
    if (mediaIndex < post.media.length - 1) {
      setMediaIndex((prev) => prev + 1);
    } else if (hasNextPost) {
      handleNextPost();
    }
  };

  const handlePrevMedia = (e) => {
    e?.stopPropagation();
    if (mediaIndex > 0) {
      setMediaIndex((prev) => prev - 1);
    } else if (hasPrevPost) {
      handlePrevPost();
    }
  };

  const handleNextPost = (e) => {
    e?.stopPropagation();
    if (hasNextPost) {
      setIsTransitioning(true);
      onNavigate(allPosts[postIndex + 1]);
    }
  };

  const handlePrevPost = (e) => {
    e?.stopPropagation();
    if (hasPrevPost) {
      setIsTransitioning(true);
      onNavigate(allPosts[postIndex - 1]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        if (hasMultipleMedia && mediaIndex < post.media.length - 1) {
          handleNextMedia();
        } else {
          handleNextPost();
        }
      }
      if (e.key === 'ArrowLeft') {
        if (hasMultipleMedia && mediaIndex > 0) {
          handlePrevMedia();
        } else {
          handlePrevPost();
        }
      }
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [post.media?.length, mediaIndex, postIndex, allPosts, onClose, hasMultipleMedia]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const formatDateExtended = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const postDateKey = post.date.split('T')[0];
  const hasStories = stories && stories[postDateKey] && stories[postDateKey].length > 0;

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalCloseButton onClick={onClose}>&times;</ModalCloseButton>

      {/* Global Post Navigation Arrows (Outside Container for desktop feel) */}
      {!isReel && hasPrevPost && (
        <NavButton $left onClick={handlePrevPost} style={{ left: '-60px' }} />
      )}
      {!isReel && hasNextPost && (
        <NavButton onClick={handleNextPost} style={{ right: '-60px' }} />
      )}

      <ModalContainer $isReel={isReel} style={{ opacity: isTransitioning ? 0.5 : 1, transition: 'opacity 0.2s' }}>
        <ModalMediaSection aspectRatio={aspectRatio} $isReel={isReel}>
          {hasMultipleMedia && (
            <>
              {mediaIndex > 0 && (
                <NavButton $left onClick={handlePrevMedia} />
              )}
              {mediaIndex < post.media.length - 1 && (
                <NavButton onClick={handleNextMedia} />
              )}
            </>
          )}

          {/* If it's a Reel, we want navigation arrows INSIDE the media section usually */}
          {isReel && (
            <>
              {hasPrevPost && <NavButton $left onClick={handlePrevPost} />}
              {hasNextPost && <NavButton onClick={handleNextPost} />}
            </>
          )}

          <MediaTrack $index={mediaIndex}>
            {post.media.map((media, idx) => (
              <MediaItem key={idx}>
                <FirebaseMedia
                  path={media.uri}
                  type={media.type}
                  alt={`Post media ${idx}`}
                  controls={media.type === 'video'}
                  autoPlay={idx === mediaIndex}
                  onLoad={handleMediaLoad}
                  onLoadedMetadata={handleMediaLoad}
                  objectFit="contain"
                  muted={isReel}
                  loop={isReel}
                />
              </MediaItem>
            ))}
          </MediaTrack>
        </ModalMediaSection>

        <ModalInfoSection $isReel={isReel}>
          <ModalHeader>
            <FeedProfileRing $hasStories={hasStories} onClick={() => hasStories && onProfileClick(postDateKey)} style={{ width: '32px', height: '32px', marginRight: '0' }}>
              <SmallProfilePic path={profilePic} $hasStories={hasStories} style={{ width: '100%', height: '100%' }} />
            </FeedProfileRing>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <ModalUsername>matheusdodia</ModalUsername>
              <ModalDate style={{ margin: 0, fontSize: '12px', textTransform: 'none' }}>{formatDateExtended(post.date)}</ModalDate>
            </div>
          </ModalHeader>

          <ModalMainContent>
            {/* Description */}
            {(post.description || isReel) && (
              <CommentRow>
                <CommentText>
                  {decodeHtml(post.description)}
                </CommentText>
              </CommentRow>
            )}

            {/* Comments */}
            {post.comments && post.comments.map((comment, idx) => (
              <CommentRow key={idx}>
                <CommentText>
                  {decodeHtml(comment.text)}
                </CommentText>
              </CommentRow>
            ))}
          </ModalMainContent>
        </ModalInfoSection>
      </ModalContainer>
    </ModalOverlay>
  );
};

const FeedPost = ({ post, profilePicSrc, formatDate, decodeHtml, getAssetUrl, stories, onProfileClick }) => {
  const [mediaIndex, setMediaIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(null);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  };

  const hasMultiple = post.media.length > 1;

  const handleNext = (e) => {
    e.stopPropagation();
    if (mediaIndex < post.media.length - 1) {
      setMediaIndex((prev) => prev + 1);
    }
  };

  const handlePrev = (e) => {
    e?.stopPropagation();
    if (mediaIndex > 0) {
      setMediaIndex((prev) => prev - 1);
    }
  };

  // Swipe Logic
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && mediaIndex < post.media.length - 1) {
      setMediaIndex(prev => prev + 1);
    }
    if (isRightSwipe && mediaIndex > 0) {
      setMediaIndex(prev => prev - 1);
    }
  };

  const postDateKey = post.date.split('T')[0];
  const hasStories = stories && stories[postDateKey] && stories[postDateKey].length > 0;

  return (
    <PostCard>
      <PostHeader>
        <FeedProfileRing $hasStories={hasStories} onClick={() => hasStories && onProfileClick(postDateKey)}>
          <SmallProfilePic path={profilePicSrc} $hasStories={hasStories} />
        </FeedProfileRing>
        <span style={{ fontWeight: 600 }}>matheusdodia</span>
        <span style={{ marginLeft: 'auto', color: '#8e8e8e', fontSize: '12px' }}>{formatDate(post.date)}</span>
      </PostHeader>
      <PostContent
        style={{ aspectRatio: aspectRatio || 'auto' }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {hasMultiple && (
          <>
            {mediaIndex > 0 && (
              <CarouselZone $left onClick={handlePrev}>
                <NavButton $left as="div" style={{ position: 'static', transform: 'none' }} />
              </CarouselZone>
            )}
            {mediaIndex < post.media.length - 1 && (
              <CarouselZone onClick={handleNext}>
                <NavButton as="div" style={{ position: 'static', transform: 'none' }} />
              </CarouselZone>
            )}
          </>
        )}
        <MediaTrack $index={mediaIndex}>
          {post.media.map((media, idx) => (
            <MediaItem key={idx}>
              <FirebaseMedia
                path={media.uri}
                type={media.type}
                controls={media.type === 'video' && idx === mediaIndex}
                onLoad={idx === 0 ? handleImageLoad : undefined}
                onLoadedMetadata={media.type === 'video' && idx === 0 ? handleImageLoad : undefined}
              />
            </MediaItem>
          ))}
        </MediaTrack>
      </PostContent>
      <PostFooter>
        <div style={{ fontSize: '14px', whiteSpace: 'pre-wrap' }}>
          <span>{decodeHtml(post.description)}</span>
        </div>
        {post.comments && post.comments.length > 0 && (
          <div style={{ fontSize: '14px' }}>
            <br />
            {post.comments.map((c, i) => (
              <div key={i} style={{ marginBottom: '4px', whiteSpace: 'pre-wrap' }}>
                {decodeHtml(c.text)}
              </div>
            ))}
          </div>
        )}
      </PostFooter>
    </PostCard>
  );
};

// --- Debug Tool Components ---

const DebugButton = styled.button`
  display: none;
`;


const Instagram = () => {
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null); // For feed view from grid
  const [activeMobileReel, setActiveMobileReel] = useState(null); // New state for mobile reels
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activeStoryDate, setActiveStoryDate] = useState(null);

  // Data State
  const [data, setData] = useState({ posts: [], stories: {}, reels: [], loading: true });



  useEffect(() => {
    if (window.innerWidth <= 736) {
      setActiveTab('feed');
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load posts first for immediate rendering
        const postsData = await fetchJsonFromStorage('instagram/posts.json');

        setData(prev => ({
          ...prev,
          posts: postsData || [],
          loading: false
        }));

        // Then load others in background
        const [storiesData, reelsData] = await Promise.all([
          fetchJsonFromStorage('instagram/stories.json'),
          fetchJsonFromStorage('instagram/reels.json')
        ]);

        setData(prev => ({
          ...prev,
          stories: storiesData || {},
          reels: (reelsData || []).sort((a, b) => new Date(a.date) - new Date(b.date))
        }));
      } catch (err) {
        console.error("Failed to load Instagram data", err);
        setData(prev => ({ ...prev, loading: false }));
      }
    };
    loadData();
  }, []);

  const { posts, stories, reels, loading } = data;

  const storyDates = Object.keys(stories).sort((a, b) => new Date(a) - new Date(b)); // Oldest first

  // Stats Calculations
  const reelsCount = posts ? posts.filter(p => p.media[0].type === 'video').length : 0;
  const storiesCount = stories ? Object.values(stories).reduce((acc, day) => acc + day.length, 0) : 0;

  const [singleDayMode, setSingleDayMode] = useState(false);
  const [visiblePosts, setVisiblePosts] = useState(10);
  const [visibleGridItems, setVisibleGridItems] = useState(15); // Initial grid items
  const [visibleStoriesCount, setVisibleStoriesCount] = useState(10);
  const feedLoaderRef = useRef(null);
  const gridLoaderRef = useRef(null); // Ref for grid infinite scroll
  const storiesLoaderRef = useRef(null);

  // Infinite Scroll logic for Feed
  useEffect(() => {
    if (activeTab !== 'feed') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisiblePosts(p => Math.min(p + 10, posts.length));
    }, { rootMargin: '200px' });
    if (feedLoaderRef.current) observer.observe(feedLoaderRef.current);
    return () => observer.disconnect();
  }, [activeTab, posts.length]);

  // Infinite Scroll logic for Grid
  useEffect(() => {
    if (activeTab !== 'posts') return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleGridItems(prev => Math.min(prev + 15, posts.length));
      }
    }, { rootMargin: '200px' });

    if (gridLoaderRef.current) {
      observer.observe(gridLoaderRef.current);
    }

    return () => observer.disconnect();
  }, [activeTab, posts.length]);

  // Lazy loader for Stories
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleStoriesCount(prev => Math.min(prev + 5, storyDates.length));
      }
    }, { rootMargin: '200px', threshold: 0.1 });

    if (storiesLoaderRef.current) {
      observer.observe(storiesLoaderRef.current);
    }
    return () => observer.disconnect();
  }, [storyDates.length]);


  // State for mobile scroll target
  const [scrollToPostId, setScrollToPostId] = useState(null);

  // Effect to handle scrolling when switching to feed with a target
  useEffect(() => {
    if (activeTab === 'feed' && scrollToPostId) {
      // Small timeout to allow render
      setTimeout(() => {
        const element = document.getElementById(scrollToPostId);
        if (element) {
          const yOffset = -60; // Approximate height of TabsContainer + Header offset
          const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({ top: y, behavior: 'instant' });
        }
        setScrollToPostId(null); // Reset
      }, 100);
    }
  }, [activeTab, scrollToPostId]);

  if (loading) {
    return <Container><div style={{ marginTop: 100 }}>Carregando...</div></Container>;
  }

  const handleOpenFeed = () => setActiveTab('feed');
  const handleCloseFeed = () => setActiveTab('posts');

  const handleOpenStories = (date, singleDay = false) => {
    setSingleDayMode(singleDay);
    setActiveStoryDate(date);

    // Attempt to enter fullscreen on mobile (Android predominantly supports this)
    if (window.innerWidth <= 736) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => { });
      } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
      }
    }
  };

  const handleCloseStories = () => {
    setActiveStoryDate(null);
    // Exit fullscreen
    if (document.exitFullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
      document.webkitExitFullscreen();
    }
  };

  const handlePostClick = (post) => {
    if (window.innerWidth <= 736) {
      if (post.media[0].type === 'video' || post.type === 'reel') {
        // Open Fullscreen Mobile Reel Viewer
        setActiveMobileReel(post);
        // Also try fullscreen API
        const elem = document.documentElement;
        if (elem.requestFullscreen) elem.requestFullscreen().catch(() => { });
        else if (elem.webkitRequestFullscreen) elem.webkitRequestFullscreen();
      } else {
        // Mobile behavior: Switch to Feed and scroll to post
        setActiveTab('feed');
        const index = posts.indexOf(post);
        if (index !== -1) {
          // If the post is not yet visible in the feed list, expand the list
          if (index >= visiblePosts) {
            setVisiblePosts(index + 5); // Load up to this post + a buffer
          }
          setScrollToPostId(`feed-post-${index}`);
        }
      }
    } else {
      // Desktop behavior: Open Lightbox
      setSelectedPost(post);
    }
  };

  const profilePicSrc = "/src/data/instagram/media/profile/202203/275015161_496804875327432_7143646680586312085_n_17894747972575070.jpg";

  const getReelThumbnail = (uri) => {
    if (!uri) return '';
    const filename = uri.split('/').pop().replace('.mp4', '.jpg');
    return `/src/data/instagram/media/reels/thumbnails/${filename}`;
  };

  return (
    <Container>
      <ContentWrapper>
        {/* Header - Always visible */}
        <ProfileHeader>
          <ProfilePicContainer>
            <ProfileImage
              path={profilePicSrc}
              alt="Profile"
            />
          </ProfilePicContainer>
          <ProfileInfo>
            <UsernameRow>
              <h2>matheusdodia</h2>
            </UsernameRow>
            <NameSection>
              <h1>Matheus José</h1>
            </NameSection>
            <StatsRow>
              <li><strong>{posts.length}</strong> posts</li>
              <li><strong>{storiesCount}</strong> stories</li>
              <li><strong>{reelsCount}</strong> reels</li>
            </StatsRow>
            <MobileStatsRow>
              <MobileStatItem>
                <span>{posts.length}</span>
                <span>posts</span>
              </MobileStatItem>
              <MobileStatItem>
                <span>{storiesCount}</span>
                <span>stories</span>
              </MobileStatItem>
              <MobileStatItem>
                <span>{reelsCount}</span>
                <span>reels</span>
              </MobileStatItem>
            </MobileStatsRow>
            <BioSection>
              <span>meu diário (quase) secreto</span>
            </BioSection>
          </ProfileInfo>
        </ProfileHeader>

        {/* Stories Row - Always visible */}
        <StoriesContainer>
          {storyDates.slice(0, visibleStoriesCount).map(date => {
            const daysStories = [...(stories[date] || [])].sort((a, b) => new Date(a.date) - new Date(b.date));
            if (daysStories.length === 0) return null;
            const preview = daysStories[0];
            const mediaItem = preview.media && preview.media[0]; // Get media item
            const thumbUri = mediaItem ? mediaItem.uri : ''; // Use first media
            const mediaType = mediaItem ? mediaItem.type : 'image';

            // Format Label avoiding timezone shift: DD/MM/YYYY
            const [year, month, day] = date.split('-');
            const label = `${day}/${month}/${year}`;

            return (
              <StoryItem key={date} onClick={() => handleOpenStories(date, false)}>
                <StoryPreviewRing>
                  <StoryPreviewImg
                    path={thumbUri}
                    type={mediaType}
                    muted
                    autoPlay
                    loop
                    objectFit="cover" /* Ensure video fills the circle */
                  />
                </StoryPreviewRing>
                <StoryLabel>{label}</StoryLabel>
              </StoryItem>
            );
          })}
          {/* Loader element for IntersectionObserver */}
          {visibleStoriesCount < storyDates.length && <div ref={storiesLoaderRef} style={{ minWidth: 20, height: 80 }} />}
        </StoriesContainer>

        {/* Navigation Tabs - Always visible */}
        <TabsContainer>
          <TabItem $active={activeTab === 'posts'} onClick={handleCloseFeed}>
            <GridIcon />
            <span>PUBLICAÇÕES</span>
          </TabItem>
          <TabItem $active={activeTab === 'reels'} onClick={() => setActiveTab('reels')}>
            <ReelsIcon />
            <span>REELS</span>
          </TabItem>
          <TabItem $active={activeTab === 'feed'} onClick={handleOpenFeed}>
            <FeedListIcon />
            <span>FEED</span>
          </TabItem>
        </TabsContainer>

        {/* View Content Switch */}
        {activeTab === 'posts' && (
          <>
            <GridContainer>
              {posts.slice(0, visibleGridItems).map((post, idx) => {
                const media = post.media[0];
                return (
                  <GridItem key={idx} onClick={() => handlePostClick(post)}>
                    <FirebaseMedia
                      path={media.uri}
                      type={media.type}
                      alt="Post"
                    />
                  </GridItem>
                );
              })}
            </GridContainer>
            {visibleGridItems < posts.length && (
              <div ref={gridLoaderRef} style={{ height: '50px', width: '100%' }}></div>
            )}
          </>
        )}

        {activeTab === 'reels' && (
          <ReelsContainer>
            {reels.map((reel, idx) => {
              const media = reel.media[0];
              return (
                <ReelsItem key={reel.media[0].uri || idx} onClick={() => handlePostClick(reel)}>
                  <FirebaseMedia
                    path={media.uri}
                    type={media.type}
                    alt="Reel"
                  />
                </ReelsItem>
              );
            })}
          </ReelsContainer>
        )}

        {activeTab === 'feed' && (
          <FeedWrapper>
            {posts.slice(0, visiblePosts).map((post, index) => (
              <div id={`feed-post-${index}`} key={index}>
                <FeedPost
                  post={post}
                  profilePicSrc={profilePicSrc}
                  formatDate={formatDate}
                  decodeHtml={decodeHtml}
                  getAssetUrl={getAssetUrl}
                  stories={stories}
                  onProfileClick={(date) => handleOpenStories(date, true)}
                />
              </div>
            ))}
            <div ref={feedLoaderRef} style={{ height: '30px' }} />
          </FeedWrapper>
        )}

      </ContentWrapper>

      {/* Lightbox for Stories */}
      {
        activeStoryDate && (
          <StoryViewer
            initialDate={activeStoryDate}
            storyDates={storyDates}
            stories={stories}
            onClose={handleCloseStories}
            profilePic={profilePicSrc}
            singleDayMode={singleDayMode}
          />
        )
      }

      {/* Mobile Fullscreen Reel Viewer */}
      {
        activeMobileReel && (
          <ReelViewer
            reel={activeMobileReel}
            onClose={() => {
              setActiveMobileReel(null);
              // Exit fullscreen
              if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen().catch(() => { });
              } else if (document.webkitExitFullscreen && document.webkitFullscreenElement) {
                document.webkitExitFullscreen();
              }
            }}
            profilePic={profilePicSrc}
          />
        )
      }

      {/* Lightbox for Posts */}
      {
        selectedPost && (
          <InstagramPostModal
            post={selectedPost}
            allPosts={activeTab === 'reels' ? reels : posts}
            onClose={() => setSelectedPost(null)}
            onNavigate={(newPost) => setSelectedPost(newPost)}
            profilePic={profilePicSrc}
            stories={stories}
            onProfileClick={(date) => handleOpenStories(date, true)}
          />
        )
      }
    </Container >
  );
};


export default Instagram;
