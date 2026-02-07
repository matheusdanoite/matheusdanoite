import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { resolveTwitterImage, loadTweetsChunk, getManifest } from '../utils/twitterLoader';
import { getStorageUrl } from '../utils/storageLoader';
import FirebaseMedia from './FirebaseMedia';

// --- Styled Components (Ported from index.html) ---

const GlobalWrapper = styled.div`
  font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;
  background-color: rgb(0, 132, 180);
  margin: 0;
  padding: 0;
  font-size: 14px;
  color: #333;
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  
  *, *::before, *::after {
    box-sizing: border-box;
  }

  a {
    color: #0084B4;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 865px;
  margin: 20px auto;
  display: flex;
  gap: 12px;
  align-items: flex-start; /* Important for sticky behavior if needed, but here simple flex */
  
  @media (max-width: 600px) {
    flex-direction: column;
    margin-top: 20px;
    padding: 0 10px; /* Add some padding on mobile */
  }
`;

// Dashboard (Left Sidebar)
const Dashboard = styled.div`
  width: 302px;
  flex-shrink: 0;
  position: sticky;
  top: 60px; /* 40px navbar + 20px margin */
  z-index: 10;

  @media (max-width: 600px) {
    width: 100%;
    position: static;
    z-index: 1;
  }
`;

const ProfileCard = styled.div`
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
  position: relative;
`;

const ProfileHeaderBg = styled.div`
  background-color: #0084B4;
  background-image: url(${props => props.$bg});
  background-size: cover;
  background-position: center;
  height: 95px;
  width: 100%;
`;

const ProfileContent = styled.div`
  padding: 12px;
`;

const AvatarContainer = styled.div`
  margin-top: -30px;
  margin-bottom: 10px;
  height: 72px;
  width: 72px;
  border: 4px solid #fff;
  border-radius: 5px;
  background: #fff;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const FullName = styled.div`
  font-weight: bold;
  font-size: 18px;
  line-height: 1.2;
  color: #292f33;
`;

const Username = styled.div`
  font-size: 12px;
  color: #8899a6;
  margin-bottom: 10px;
`;

const Bio = styled.div`
  font-size: 14px;
  margin-bottom: 10px;
`;

const MetaItem = styled.div`
  font-size: 12px;
  color: #8899a6;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const StatsTable = styled.div`
  border-top: 1px solid #e1e8ed;
  margin-top: 12px;
  padding-top: 12px;
  display: flex;
  width: 100%;
`;

const StatItem = styled.div`
  /* flex: 1; removed to align left */
  margin-right: 20px; /* Add spacing between items */
  font-size: 10px;
  color: #8899a6;
  text-transform: uppercase;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #0084B4;
    
    span {
      color: #0084B4;
    }
  }
`;

const StatValue = styled.span`
  display: block;
  font-size: 18px;
  color: #0084B4;
  font-weight: bold;
  margin-top: 2px;
`;

// Content Feed (Right/Main)
const ContentMain = styled.div`
  width: 600px;
  flex: 1;
  background: #fff;
  border-radius: 6px;
  min-height: 500px;
  overflow: hidden;

  @media (max-width: 600px) {
    width: 100%;
    /* border-radius: 0; removed to keep rounded corners */
  }
`;

const ContentHeader = styled.div`
  padding: 10px 15px;
  border-bottom: 1px solid #e1e8ed;
  
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #292f33;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 20px;
`;

const TabItem = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.$active ? '#292f33' : '#8899a6'};
  cursor: pointer;
  
  &:hover {
    color: #0084B4;
    text-decoration: ${props => props.$active ? 'none' : 'underline'};
  }
`;

const TweetContainer = styled.div`
  /* padding: 0; */
`;

const Tweet = styled.div`
  padding: 12px 15px;
  border-bottom: 1px solid #e1e8ed;
  display: flex;
  gap: 10px;
  transition: background-color 0.1s;
  
  &:hover {
    background-color: #f5f8fa;
  }
`;

const TweetAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 5px;
  flex-shrink: 0;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 4px;
    object-fit: cover;
  }
`;

const TweetBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const TweetHeader = styled.div`
  margin-bottom: 2px;
`;

const TweetName = styled.span`
  font-weight: bold;
  color: #292f33;
  margin-right: 5px;
`;

const TweetUsername = styled.span`
  color: #8899a6;
  font-size: 13px;
  margin-right: 5px;
`;

const TweetTime = styled.span`
  color: #8899a6;
  font-size: 13px;
  
  &::before {
    content: "·";
    margin: 0 3px;
  }
`;

const TweetText = styled.div`
  font-size: 14px;
  line-height: 18px;
  color: #292f33;
  white-space: pre-wrap;
  margin-bottom: 10px;
`;

const TweetMedia = styled.div`
  margin-top: 10px;
  border-radius: 5px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
  
  ${props => props.$isGrid && `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2px;
  `}

  img, video {
    display: block;
    max-width: 100%;
    width: 100%;
    
    ${props => props.$isGrid ? `
      height: 100%;
      object-fit: cover;
    ` : `
      height: auto;
    `}
  }
`;

const MediaGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columns as requested */
  gap: 5px;
  padding: 10px;
`;

const MediaGridItem = styled.div`
  aspect-ratio: 1; /* Square format */
  overflow: hidden;
  border-radius: 4px;
  background-color: #f5f8fa;
  position: relative;
  
  img, video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Sentinel = styled.div`
  padding: 20px;
  text-align: center;
  color: #8899a6;
`;

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for iOS */
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  padding: 0; /* Remove padding to maximize space */
  box-sizing: border-box;
`;

const slideInRight = `
  @keyframes slideInRight {
    from { transform: translateX(50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const slideInLeft = `
  @keyframes slideInLeft {
    from { transform: translateX(-50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const LightboxContent = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  animation: ${props => props.direction === 'next' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out;
  ${slideInRight}
  ${slideInLeft}
`;

const MediaWrapper = styled.div`
  position: relative;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 100dvh;
`;

const LightboxImg = styled(FirebaseMedia)`
  max-width: 100vw;
  max-height: 100dvh;
  width: auto;
  height: auto;
  object-fit: contain;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  cursor: default;
  /* Ensure it doesn't block clicks to background if it doesn't fill */
  pointer-events: auto; 
  display: block; /* Remove inline spacing */
`;

const LightboxTweet = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.6) 80%, transparent 100%);
  padding: 20px;
  padding-bottom: max(20px, env(safe-area-inset-bottom)); /* iOS safe area */
  color: #fff;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity 0.3s ease;
  pointer-events: ${props => props.$visible ? 'auto' : 'none'};
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  z-index: 3002;

  @media (max-width: 600px) {
    padding: 15px;
    padding-bottom: max(15px, env(safe-area-inset-bottom));
  }
`;

const LightboxUserRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const LightboxAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
  overflow: hidden;
  img { width: 100%; height: 100%; object-fit: cover; }
`;

const LightboxContentCol = styled.div`
  flex: 1;
  min-width: 0;
`;

const LightboxHeader = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.2;
`;

const LightboxName = styled.span`
  font-weight: bold;
  font-size: 15px;
  color: #fff;
`;

const LightboxMeta = styled.div`
  color: #8899a6;
  font-size: 13px;
  margin-top: 10px;
  border-top: 1px solid #38444d;
  padding-top: 8px;
`;

const LightboxText = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: #fff;
  white-space: pre-wrap;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 10px;
  line-height: 1;
  z-index: 3001;
  
  &:hover {
    opacity: 0.8;
  }
`;

// --- Loading Skeletons ---

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: 200px 0; }
  }
`;

const SkeletonBase = styled.div`
  background: linear-gradient(90deg, #e8e8e8 0px, #f5f5f5 50px, #e8e8e8 100px);
  background-size: 200px 100%;
  animation: shimmer 1.2s infinite linear;
  ${shimmer}
`;

const SkeletonTweet = styled.div`
  padding: 12px;
  display: flex;
  gap: 12px;
  border-bottom: 1px solid #e1e8ed;
`;

const SkeletonAvatar = styled(SkeletonBase)`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  flex-shrink: 0;
`;

const SkeletonContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SkeletonLine = styled(SkeletonBase)`
  height: ${props => props.height || '14px'};
  width: ${props => props.width || '100%'};
  border-radius: 4px;
`;

const SkeletonMedia = styled(SkeletonBase)`
  height: 180px;
  border-radius: 12px;
  margin-top: 8px;
`;

const LoadingSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <SkeletonTweet key={i}>
        <SkeletonAvatar />
        <SkeletonContent>
          <SkeletonLine width="40%" height="16px" />
          <SkeletonLine width="80%" />
          <SkeletonLine width="60%" />
          {i % 2 === 0 && <SkeletonMedia />}
        </SkeletonContent>
      </SkeletonTweet>
    ))}
  </>
);

// --- Component ---

const Twitter = () => {
  // Static paths (cleaned)
  const profileImgPath = resolveTwitterImage('/src/data/twitter/data/profile_media/125515755-hxB9hFTM.png');
  const headerImgPath = resolveTwitterImage('/src/data/twitter/data/profile_media/125515755-1596834705.jpg');

  const [headerImgUrl, setHeaderImgUrl] = useState('');

  useEffect(() => {
    getStorageUrl(headerImgPath).then(setHeaderImgUrl);
  }, [headerImgPath]);


  const [tweets, setTweets] = useState([]);
  const [visibleTweets, setVisibleTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('tweets');
  const [lightboxIndex, setLightboxIndex] = useState(null); // index in lightboxImages
  const [navDirection, setNavDirection] = useState('next');
  const [touchStart, setTouchStart] = useState(null);
  const [visibleMediaCount, setVisibleMediaCount] = useState(60); // Start with 60 media items
  const sentinelRef = useRef(null);
  const mediaSentinelRef = useRef(null);
  const isFetchingChunk = useRef(false);

  const BATCH_SIZE = 20;
  const MEDIA_BATCH_SIZE = 60;

  // --- Helpers ---

  const getFilename = (url) => {
    const noQuery = url.split('?')[0];
    return noQuery.substring(noQuery.lastIndexOf('/') + 1);
  };

  const formatDate = (dateString, includeTime = false) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const datePart = date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }).replace(/ de /g, ' ');
    if (!includeTime) return datePart;

    const timePart = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${timePart} · ${datePart} `;
  };

  const [showOverlay, setShowOverlay] = useState(true);
  const overlayTimerRef = useRef(null);

  const resetOverlayTimer = () => {
    setShowOverlay(true);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    overlayTimerRef.current = setTimeout(() => {
      setShowOverlay(false);
    }, 3000); // Disappear after 3 seconds of inactivity
  };

  const handleMouseMove = () => {
    resetOverlayTimer();
  };

  const handleMouseLeave = () => {
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
    setShowOverlay(false);
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
    // Check if it's the background container
    if (e.target === e.currentTarget) {
      closeLightbox();
      return;
    }

    // Check if it is media (Img or Video)
    const tagName = e.target.tagName;
    if (tagName === 'IMG' || tagName === 'VIDEO') {
      setShowOverlay(prev => !prev);
      if (!showOverlay) {
        // We are showing it now
        if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
        overlayTimerRef.current = setTimeout(() => {
          setShowOverlay(false);
        }, 3000);
      }
    }
  };


  const getCleanText = (t) => {
    let text = t.text;
    // Remove t.co URLs from text (media links are already stripped in clean data)
    text = text.replace(/https:\/\/t\.co\/\w+/g, '');
    return text.trim();
  };

  const getMediaUrl = (media, tweetId) => {
    if (!media.filename) return '';
    // Construct path compatible with our loader's expectation or raw path if loader handles it
    // Our loader expects e.g. "tweets_media/123-file.jpg"
    return resolveTwitterImage(`tweets_media/${tweetId}-${media.filename}`);
  };

  const getThumbUrl = (media, tweetId) => {
    if (!media.filename) return '';
    if (media.type === 'video' || media.type === 'animated_gif') {
      // Use generated thumbnail for video (assumed jpg)
      // Pass the filename as-is (loader fuzzy match handles ID prefix) but ensure we request from thumbs directory
      // and imply .jpg extension if needed? My generation script made .jpg
      // BUT media.filename might be .mp4 or .jpg.
      // If I request `thumbs/${tweetId}-${media.filename}` and media.filename is `foo.mp4`, 
      // loader will look for `thumbs/...foo.mp4` fuzzy.
      // My thumbs are `.jpg`. 
      // I should enforce .jpg extension.
      const filenameBase = media.filename.substring(0, media.filename.lastIndexOf('.')) || media.filename;
      return resolveTwitterImage(`tweets_media/thumbs/${tweetId}-${filenameBase}.jpg`);
    }
    // Use medium quality for feed thumbs as specific thumbs don't exist
    return resolveTwitterImage(`tweets_media/medium/${tweetId}-${media.filename}`);
  };

  const getMediumUrl = (media, tweetId) => {
    if (!media.filename) return '';
    if (media.type === 'video' || media.type === 'animated_gif') {
      return getMediaUrl(media, tweetId);
    }
    return resolveTwitterImage(`tweets_media/medium/${tweetId}-${media.filename}`);
  };

  // --- Data Processing ---

  // Extract all media, memoized
  const allMedia = React.useMemo(() => {
    return tweets.flatMap(t => {
      if (!t.media || t.media.length === 0) return [];

      const cleanText = getCleanText(t);
      const dateStr = formatDate(t.date, true); // Include time for media grid/lightbox context

      return t.media.map(media => {
        const localPath = getMediaUrl(media, t.id);
        const thumbPath = getThumbUrl(media, t.id);
        const mediumPath = getMediumUrl(media, t.id);
        return {
          ...media,
          tweetId: t.id,
          date: dateStr,
          text: cleanText,
          localPath,
          thumbPath,
          mediumPath
        };
      });
    });
  }, [tweets]);

  // Include all media in lightbox navigation (videos too)
  const lightboxImages = React.useMemo(() => {
    return allMedia.filter(m => m.mediumPath || m.localPath);
  }, [allMedia]);

  const openLightbox = (mediumPath) => {
    const index = lightboxImages.findIndex(img => img.mediumPath === mediumPath);
    if (index !== -1) {
      setLightboxIndex(index);
      setShowOverlay(true); // Always show initially
      resetOverlayTimer();
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    if (overlayTimerRef.current) clearTimeout(overlayTimerRef.current);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        setNavDirection('next');
        setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
      } else if (e.key === 'ArrowLeft') {
        setNavDirection('prev');
        setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, lightboxImages]);

  // Swipe Navigation
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    // Minimum swipe distance of 50px
    if (distance > 50) {
      // Swipe left -> Next image
      setNavDirection('next');
      setLightboxIndex((prev) => (prev + 1) % lightboxImages.length);
    } else if (distance < -50) {
      // Swipe right -> Previous image
      setNavDirection('prev');
      setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length);
    }
    setTouchStart(null);
  };

  // Lock body scroll
  useEffect(() => {
    if (lightboxIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [lightboxIndex]);


  // --- Fetching ---

  // --- Fetching ---

  // State to track total chunks
  const [totalChunks, setTotalChunks] = useState(0);

  // Load a specific chunk index and append it to our tweets list
  // For 'oldest first' (chronological), we load chunks in reverse order (52, 51, ... 0)
  // And we reverse the content of each chunk so its internal order is oldest->newest.
  // The accumulated 'tweets' array will be [OldestChunkReversed, NextOldestChunkReversed...]
  const loadChunk = async (index) => {
    if (isFetchingChunk.current) return false;
    isFetchingChunk.current = true;
    console.log(`Loading chunk ${index}...`);
    try {
      const rawTweets = await loadTweetsChunk(index);
      if (rawTweets && rawTweets.length > 0) {
        // Reverse here to make it oldest -> newest
        const newTweets = [...rawTweets].reverse();

        setTweets(prev => {
          const existingIds = new Set(prev.map(t => t.id));
          const uniqueNew = newTweets.filter(t => !existingIds.has(t.id));
          return [...prev, ...uniqueNew];
        });

        if (tweets.length === 0) {
          // If first load, might set visible here, but effect below handles it.
          // We can rely on the effect.
        }
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error loading chunk", index, err);
      return false;
    } finally {
      isFetchingChunk.current = false;
    }
  };

  // Initial Load
  // Initial Load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const manifest = await getManifest();
        if (manifest && manifest.totalChunks) {
          setTotalChunks(manifest.totalChunks);
          // Start from the last chunk (oldest)
          const startChunk = manifest.totalChunks - 1;
          setChunkIndex(startChunk);
          await loadChunk(startChunk);

          // Force visibility initialization here to avoid race conditions or waiting for effect
          // Actually, relying on effect is safer if state updates batch.
        } else {
          // Fallback if manifest fails?
          await loadChunk(0);
        }
      } catch (e) {
        console.error("Manifest load failed", e);
        await loadChunk(0);
      }
      setLoading(false);
    };
    init();
  }, []);

  // Infinite Scroll for Tweets (Load more from current tweets array OR fetch next chunk)
  useEffect(() => {
    if (loading || activeTab !== 'tweets') return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadMoreTweets();
      }
    }, { rootMargin: '400px' });

    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => { if (sentinelRef.current) observer.unobserve(sentinelRef.current); };
  }, [loading, tweets, currentIndex, activeTab]);

  const [chunkIndex, setChunkIndex] = useState(0);

  const loadMoreTweets = async () => {
    // If we have more tweets in the current loaded array, show them
    if (currentIndex < tweets.length) {
      const nextIndex = Math.min(currentIndex + BATCH_SIZE, tweets.length);
      setVisibleTweets(prev => [...prev, ...tweets.slice(currentIndex, nextIndex)]);
      setCurrentIndex(nextIndex);
    } else {
      // Reached end of loaded tweets. Load earlier chunk (moves towards newest date).
      const nextChunkIdx = chunkIndex - 1;
      if (nextChunkIdx >= 0) {
        const success = await loadChunk(nextChunkIdx);
        if (success) {
          setChunkIndex(nextChunkIdx);
        }
      }
    }
  };

  // Effect to append visible tweets when tweets array grows (from chunk load)
  useEffect(() => {
    if (tweets.length > visibleTweets.length && currentIndex === visibleTweets.length && !loading) {
      // We just loaded a chunk, show first batch of it
      const nextIndex = Math.min(currentIndex + BATCH_SIZE, tweets.length);
      setVisibleTweets(prev => [...prev, ...tweets.slice(currentIndex, nextIndex)]);
      setCurrentIndex(nextIndex);
    }
  }, [tweets.length]);




  // Media grid infinite scroll
  useEffect(() => {
    if (loading || activeTab !== 'media') return;

    const observer = new IntersectionObserver((entries) => {
      // If intersecting and we have more media in CURRENT loaded list, show them
      if (entries[0].isIntersecting) {
        if (visibleMediaCount < allMedia.length) {
          setVisibleMediaCount(prev => Math.min(prev + MEDIA_BATCH_SIZE, allMedia.length));
        } else {
          // Load more chunks (moving towards newer dates)
          const nextChunkIdx = chunkIndex - 1;
          if (nextChunkIdx >= 0) {
            loadChunk(nextChunkIdx).then(success => {
              if (success) {
                setChunkIndex(nextChunkIdx);
              }
            });
          }
        }
      }
    }, { rootMargin: '600px' });

    if (mediaSentinelRef.current) observer.observe(mediaSentinelRef.current);
    return () => { if (mediaSentinelRef.current) observer.unobserve(mediaSentinelRef.current); };
  }, [loading, activeTab, visibleMediaCount, allMedia.length, chunkIndex]);

  // Intelligent preloading - preload images for next batch of tweets
  useEffect(() => {
    if (loading || tweets.length === 0) return;

    const preloadStart = currentIndex;
    const preloadEnd = Math.min(currentIndex + BATCH_SIZE * 2, tweets.length);
    const upcomingTweets = tweets.slice(preloadStart, preloadEnd);

    // Preload thumbnail images for upcoming tweets
    upcomingTweets.forEach(t => {
      if (t.media && t.media.length > 0) {
        t.media.forEach(media => {
          if (media.type !== 'video' && media.type !== 'animated_gif') {
            const thumbPath = getThumbUrl(media, t.id);
            if (thumbPath) {
              getStorageUrl(thumbPath).then(url => {
                if (url) {
                  const img = new Image();
                  img.src = url;
                }
              });
            }
          }
        });
      }
    });
  }, [currentIndex, tweets, loading]);

  // --- Render Helpers ---

  const renderMedia = (t) => {
    if (!t.media || t.media.length === 0) return null;

    const mediaList = t.media;
    const isGrid = mediaList.length > 1;

    return (
      <TweetMedia $isGrid={isGrid}>
        {mediaList.map((media, idx) => {
          const isVideo = media.type === 'video' || media.type === 'animated_gif';

          const localPath = getMediaUrl(media, t.id);
          const thumbPath = getThumbUrl(media, t.id);
          const mediumPath = getMediumUrl(media, t.id);

          // Validation
          if (isVideo && !localPath) return null;
          if (!isVideo && !thumbPath) return null;

          // Note: using localPath (storage path) for both video src and poster (thumbPath)
          // FirebaseMedia handles fetching the URL.
          // For video, we pass path={localPath}.
          // How to pass poster? FirebaseMedia doesn't strictly support resolving poster URL automatically if passed as prop.
          // We can just rely on the video loading or pass a resolved poster URL if we want to improve it later.
          // But generic FirebaseMedia might not resolve 'poster' prop if it's a path.
          // It only resolves 'path' prop to 'src'.
          // If we mostly care about the content, let's just use FirebaseMedia as video.
          // Or we can manually resolve poster if critical.

          if (isVideo) {
            return (
              <FirebaseMedia
                key={idx}
                path={localPath}
                type="video"
                controls
                preload="none"
              // poster={thumbPath} // Won't work if thumbPath is a path string unless FirebaseMedia handles it.
              // For now omitting poster or relying on video metadata.
              />
            );
          }
          return (
            <FirebaseMedia
              key={idx}
              path={thumbPath}
              alt="Tweet media"
              loading="lazy"
              style={{ cursor: 'pointer' }}
              onClick={() => openLightbox(mediumPath)}
            />
          );
        })}
      </TweetMedia>
    );
  };

  const currentPhoto = lightboxIndex !== null ? lightboxImages[lightboxIndex] : null;

  if (error) return <div style={{ color: 'white', padding: 20, textAlign: 'center' }}>{error}</div>;

  // Render

  // Use headerImgUrl for background
  return (
    <GlobalWrapper>
      <Container>
        {/* Left Dashboard */}
        <Dashboard>
          <ProfileCard>
            <ProfileHeaderBg $bg={headerImgUrl} />
            <ProfileContent>
              <AvatarContainer>
                <FirebaseMedia path={profileImgPath} alt="Avatar" />
              </AvatarContainer>
              <FullName>matheus</FullName>
              <Username>@matheusdanoite</Username>
              <Bio>desventuras em série</Bio>
              <MetaItem>Guarapuava, PR</MetaItem>
              <MetaItem>Criado em 22 de março de 2010</MetaItem>

              <StatsTable>
                <StatItem onClick={() => setActiveTab('tweets')}>
                  Tweets
                  <StatValue>26.014</StatValue>
                </StatItem>
                <StatItem onClick={() => setActiveTab('media')}>
                  Mídia
                  <StatValue>3.353</StatValue>
                </StatItem>
              </StatsTable>
            </ProfileContent>
          </ProfileCard>
        </Dashboard>

        {/* Main Content */}
        <ContentMain>

          {activeTab === 'tweets' && (
            <TweetContainer>
              {loading && <LoadingSkeleton />}

              {!loading && visibleTweets.map((t, i) => {
                const dateStr = formatDate(t.date);
                const cleanText = getCleanText(t);
                const tweetIndex = tweets.findIndex(tweet => tweet.id === t.id); // Find original index for lightbox

                return (
                  <Tweet key={t.id || i}>
                    <TweetAvatar>
                      <FirebaseMedia path={profileImgPath} alt="Avatar" />
                    </TweetAvatar>
                    <TweetBody>
                      <TweetHeader>
                        <TweetName>matheus</TweetName>
                        <TweetUsername>@matheusdanoite</TweetUsername>
                        <TweetTime>{formatDate(t.date, true)}</TweetTime>
                      </TweetHeader>
                      <TweetText>{cleanText}</TweetText>
                      {renderMedia(t, tweetIndex)}
                    </TweetBody>
                  </Tweet>
                );
              })}

              {!loading && currentIndex < tweets.length && (
                <Sentinel ref={sentinelRef}>Carregando mais...</Sentinel>
              )}
            </TweetContainer>
          )}

          {activeTab === 'media' && (
            <MediaGridContainer>
              {allMedia.slice(0, visibleMediaCount).map((media, idx) => {
                if (!media.thumbPath) return null;
                const isVideo = media.type === 'video' || media.type === 'animated_gif';

                return (
                  <MediaGridItem key={idx}>
                    <FirebaseMedia
                      path={media.thumbPath}
                      type={media.type}
                      alt="Media"
                      loading="lazy"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openLightbox(media.mediumPath)}
                    />
                    {isVideo && (
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: 'white', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '10px'
                      }}>
                        ▶
                      </div>
                    )}
                  </MediaGridItem>
                )
              })}
              <div ref={mediaSentinelRef} style={{ gridColumn: '1 / -1', padding: '20px', textAlign: 'center', color: '#999', fontSize: '11px' }}>
                {visibleMediaCount < allMedia.length || chunkIndex > 0 ? 'carregando mais mídia...' : 'fim das mídias'}
              </div>
            </MediaGridContainer>
          )}
        </ContentMain>
      </Container>

      {/* Lightbox */}
      {currentPhoto && (
        <LightboxOverlay
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <CloseButton onClick={closeLightbox}>&times;</CloseButton>
          <LightboxContent
            key={lightboxIndex}
            direction={navDirection}
            onClick={handleContentClick}
          >
            <MediaWrapper>
              {(currentPhoto.type === 'video' || currentPhoto.type === 'animated_gif') ? (
                <FirebaseMedia
                  path={currentPhoto.mediumPath} // localPath or mediumPath
                  type="video"
                  controls
                  autoPlay
                  style={{
                    maxWidth: '100vw',
                    maxHeight: '100dvh',
                    width: 'auto',
                    height: 'auto',
                    boxShadow: '0 0 20px rgba(0,0,0,0.5)',
                    display: 'block'
                  }}
                />
              ) : (
                <LightboxImg
                  path={currentPhoto.mediumPath}
                  alt="Full view"
                />
              )}
              <LightboxTweet $visible={showOverlay}>
                <LightboxText>{currentPhoto.text}</LightboxText>
                <LightboxMeta>{currentPhoto.date}</LightboxMeta>
              </LightboxTweet>
            </MediaWrapper>
          </LightboxContent>
        </LightboxOverlay>
      )}
    </GlobalWrapper>
  );
};

export default Twitter;
