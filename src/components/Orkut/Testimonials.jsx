import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { WhiteBox, BoxTitle } from './OrkutLayout';
import { fetchJsonFromStorage } from '../../utils/storageLoader';
import { resolveOrkutImage } from '../../utils/orkutImageLoader';
import FirebaseMedia from '../FirebaseMedia';

const TestimonialItem = styled.div`
  border-bottom: 1px solid #e5e5e5;
  padding: 15px;
  display: flex;
  gap: 15px;
  animation: fadeIn 0.4s ease-out;
  
  &:last-child {
    border-bottom: none;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const TestimonialHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  font-size: 11px;
`;

const AuthorImg = styled(FirebaseMedia)`
  width: 64px;
  height: 64px;
  border-radius: 4px;
  border: 1px solid #ddd;
  object-fit: cover;
  background-color: #f0f0f0;
`;

const AuthorName = styled.div`
  font-weight: bold;
  color: #06c;
`;

const TestimonialDate = styled.div`
  color: #666;
`;

const TestimonialContent = styled.div`
  line-height: 1.5;
  font-size: 13px;
  word-break: break-word;
`;



const ITEMS_PER_PAGE = 20;

const Testimonials = () => {
  const ITEMS_PER_PAGE = 20;
  const [items, setItems] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const observer = useRef();

  useEffect(() => {
    fetchJsonFromStorage('orkut/depoimentos.json').then(data => setItems(data || []));
  }, []);

  const lastElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleCount < items.length) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
    }, { rootMargin: '400px' });
    if (node) observer.current.observe(node);
  }, [visibleCount, items.length]);

  const visibleItems = items.slice(0, visibleCount);

  return (
    <WhiteBox>
      <BoxTitle>depoimentos ({items.length})</BoxTitle>
      <div style={{ padding: '0' }}>
        {visibleItems.map((item, index) => (
          <TestimonialItem
            key={item.id}
            ref={index === Math.max(0, visibleItems.length - 5) ? lastElementRef : null}
          >
            <AuthorImg
              path={resolveOrkutImage(item.authorPhoto)}
              alt={item.author}
              loading="lazy"
            />
            <div style={{ flex: 1 }}>
              <TestimonialHeader>
                <AuthorName>{item.author}</AuthorName>
                <TestimonialDate>{item.date}</TestimonialDate>
              </TestimonialHeader>
              <TestimonialContent dangerouslySetInnerHTML={{ __html: item.content }} />
            </div>
          </TestimonialItem>
        ))}

        {visibleCount < items.length && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '11px' }}>
            pegando mais depoimentos...
          </div>
        )}
      </div>
    </WhiteBox>
  );
};

export default Testimonials;
