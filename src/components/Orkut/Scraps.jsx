import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { WhiteBox, BoxTitle } from './OrkutLayout';
import { fetchJsonFromStorage } from '../../utils/storageLoader';
import FirebaseMedia from '../FirebaseMedia';
import { resolveOrkutImage } from '../../utils/orkutImageLoader';

const ScrapItem = styled.div`
  border-bottom: 1px solid #e5e5e5;
  padding: 15px;
  display: flex;
  gap: 15px;
  animation: fadeIn 0.4s ease-out;
  
  &:hover {
    background-color: #f7f9fc;
  }
  
  &:last-child {
    border-bottom: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const ScrapAuthorImg = styled(FirebaseMedia)`
  width: 64px;
  height: 64px;
  border-radius: 4px;
  border: 1px solid #ddd;
  object-fit: cover;
  background-color: #f0f0f0;
`;

const ScrapHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 11px;
`;

const ScrapAuthorName = styled.span`
  font-weight: bold;
  color: #06c;
`;

const ScrapDate = styled.span`
  color: #666;
`;

const ScrapContent = styled.div`
  line-height: 1.5;
  word-break: break-word;
  font-size: 13px;
  color: #333;
  
  font {
    color: inherit !important;
  }

  img {
    max-width: 100%;
    height: auto;
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

const SkeletonScrap = styled.div`
  border-bottom: 1px solid #e5e5e5;
  padding: 15px;
  display: flex;
  gap: 15px;
`;

const SkeletonAvatar = styled(SkeletonBase)`
  width: 64px;
  height: 64px;
  border-radius: 4px;
  flex-shrink: 0;
`;

const SkeletonLine = styled(SkeletonBase)`
  height: ${props => props.height || '14px'};
  width: ${props => props.width || '100%'};
  border-radius: 4px;
  margin-bottom: 8px;
`;

const LoadingSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <SkeletonScrap key={i}>
        <SkeletonAvatar />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="30%" height="12px" />
          <SkeletonLine width="80%" />
          <SkeletonLine width="60%" />
        </div>
      </SkeletonScrap>
    ))}
  </>
);

const ITEMS_PER_PAGE = 20;
const CHUNK_SIZE = 100;
const TOTAL_SCRAPS = 1803;

const Scraps = () => {
  const [scraps, setScraps] = useState([]);
  const [loadedChunks, setLoadedChunks] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [loading, setLoading] = useState(true);
  const observer = useRef();

  // Load a chunk dynamically
  const loadChunk = useCallback(async (chunkIndex) => {
    if (loadedChunks.has(chunkIndex)) return;

    try {
      // Changed from dynamic import to fetchJsonFromStorage
      const chunkData = await fetchJsonFromStorage(`orkut/chunks/scraps_chunk_${chunkIndex}.json`);
      if (!chunkData) return;

      setScraps(prev => {
        const newScraps = [...prev];
        const startIdx = chunkIndex * CHUNK_SIZE;
        chunkData.forEach((item, idx) => {
          newScraps[startIdx + idx] = item;
        });
        return newScraps;
      });

      setLoadedChunks(prev => new Set([...prev, chunkIndex]));
    } catch (err) {
      console.error(`Failed to load chunk ${chunkIndex}:`, err);
    }
  }, [loadedChunks]);

  // Load initial chunk
  useEffect(() => {
    loadChunk(0).then(() => setLoading(false));
  }, []);

  // Load more chunks as user scrolls
  useEffect(() => {
    const neededChunk = Math.floor((visibleCount - 1) / CHUNK_SIZE);
    const nextChunk = neededChunk + 1;

    // Preload current and next chunk
    if (!loadedChunks.has(neededChunk)) {
      loadChunk(neededChunk);
    }
    if (nextChunk * CHUNK_SIZE < TOTAL_SCRAPS && !loadedChunks.has(nextChunk)) {
      loadChunk(nextChunk);
    }
  }, [visibleCount, loadedChunks, loadChunk]);

  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < TOTAL_SCRAPS) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
    }, { rootMargin: '400px' });
    if (node) observer.current.observe(node);
  }, [visibleCount]);

  const visibleScraps = scraps.slice(0, visibleCount).filter(Boolean);

  if (loading) {
    return (
      <WhiteBox>
        <BoxTitle>recados ({TOTAL_SCRAPS})</BoxTitle>
        <LoadingSkeleton />
      </WhiteBox>
    );
  }

  return (
    <WhiteBox>
      <BoxTitle>recados ({TOTAL_SCRAPS})</BoxTitle>
      <div style={{ padding: '0' }}>
        {visibleScraps.map((scrap, index) => (
          <ScrapItem
            key={scrap.id}
            ref={index === Math.max(0, visibleScraps.length - 5) ? lastElementRef : null}
          >
            <ScrapAuthorImg
              path={resolveOrkutImage(scrap.authorPhoto)}
              alt={scrap.author}
              loading="lazy"
            />
            <div style={{ flex: 1 }}>
              <ScrapHeader>
                <ScrapAuthorName>{scrap.author}</ScrapAuthorName>
                <ScrapDate>{scrap.date}</ScrapDate>
              </ScrapHeader>
              <ScrapContent dangerouslySetInnerHTML={{ __html: scrap.content }} />
            </div>
          </ScrapItem>
        ))}

        {visibleCount < TOTAL_SCRAPS && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '11px' }}>
            pegando mais recados...
          </div>
        )}
      </div>
    </WhiteBox>
  );
};

export default Scraps;
