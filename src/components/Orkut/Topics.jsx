import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { WhiteBox, BoxTitle } from './OrkutLayout';
import { fetchJsonFromStorage } from '../../utils/storageLoader';
import TopicDetail from './TopicDetail';

const TopicItem = styled.div`
  border-bottom: 1px solid #e5e5e5;
  padding: 12px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeIn 0.4s ease-out;
  cursor: pointer;
  
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

const TopicTitle = styled.div`
  font-size: 13px;
  color: #06c;
  font-weight: bold;
`;



const ITEMS_PER_PAGE = 20;

const Topics = () => {
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const observer = useRef();
    const [topics, setTopics] = useState([]);

    useEffect(() => {
        fetchJsonFromStorage('orkut/topics.json').then(data => setTopics(data || []));
    }, []);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            });
        } catch (e) {
            return '';
        }
    };

    const lastElementRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleCount < topics.length) {
                setVisibleCount(prev => prev + ITEMS_PER_PAGE);
            }
        }, { rootMargin: '400px' });
        if (node) observer.current.observe(node);
    }, [visibleCount, topics.length]);

    if (selectedTopic) {
        return <TopicDetail topic={selectedTopic} onBack={() => setSelectedTopic(null)} />;
    }

    const visibleTopics = topics.slice(0, visibleCount);

    return (
        <WhiteBox>
            <BoxTitle>tópicos ({topics.length})</BoxTitle>
            <div style={{ padding: '0' }}>
                {visibleTopics.map((topic, index) => (
                    <TopicItem
                        key={topic.id}
                        ref={index === Math.max(0, visibleTopics.length - 5) ? lastElementRef : null}
                        onClick={() => setSelectedTopic(topic)}
                    >
                        <div style={{ flex: 1 }}>
                            <TopicTitle>{topic.title}</TopicTitle>
                            <div style={{ fontSize: '11px', color: '#06c', marginTop: '2px' }}>
                                {topic.community}
                            </div>
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                                criado em {formatDate(topic.dateISO) || topic.date}
                            </div>
                        </div>

                    </TopicItem>
                ))}

                {visibleCount < topics.length && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '11px' }}>
                        pegando mais tópicos...
                    </div>
                )}
            </div>
        </WhiteBox>
    );
};

export default Topics;
