import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { WhiteBox, BoxTitle } from './OrkutLayout';
import { fetchJsonFromStorage } from '../../utils/storageLoader';
import { resolveOrkutImage } from '../../utils/orkutImageLoader';
import FirebaseMedia from '../FirebaseMedia';

const UpdateItem = styled.div`
  padding: 15px 20px;
  border-bottom: 1px solid #e5e5e5;
  display: flex;
  align-items: flex-start;
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

const UpdateImg = styled(FirebaseMedia)`
  width: 48px;
  height: 48px;
  border-radius: 4px;
  border: 1px solid #ddd;
  object-fit: cover;
  flex-shrink: 0;
  background-color: #f0f0f0;
`;

const UpdateIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: #f0f2f5;
  border-radius: 4px;
  border: 1px solid #e1e4e8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  color: #5778a1;
`;

const UpdateContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UpdateText = styled.div`
  font-size: 13px;
  color: #333;
  line-height: 1.5;

  b {
    color: #06c;
    font-weight: bold !important;
  }
`;

const UpdateDate = styled.div`
  font-size: 11px;
  color: #666;
`;

const Quote = styled.div`
  background-color: #f1f3f8;
  border-left: 3px solid #6d84b4;
  padding: 8px 12px;
  font-style: italic;
  font-size: 12px;
  color: #555;
  margin-top: 6px;
  border-radius: 0 4px 4px 0;
`;

const FriendsGrid = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 6px;
  flex-wrap: wrap;
`;

const SmallFriendImg = styled(FirebaseMedia)`
  width: 32px;
  height: 32px;
  border-radius: 2px;
  border: 1px solid #ddd;
  object-fit: cover;
  background-color: #f0f0f0;
`;

const DescriptionBox = styled.div`
  margin-top: 4px;
  font-size: 13px;
  color: #555;
  line-height: 1.5;
`;

const UpdateHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 15px;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 4px;
    
    & > div:last-child {
      align-self: flex-start;
      margin-top: 2px;
    }
  }
`;

const ITEMS_PER_PAGE = 30;
const CHUNK_SIZE = 100;
const TOTAL_UPDATES = 1184;

const processUpdates = (updates) => {
    let processed = [];
    updates.forEach(u => {
        if (u.type === 'new_friend_aggregated' && u.friends && u.friends.length > 1) {
            u.friends.forEach((f, idx) => {
                processed.push({
                    ...u,
                    id: `${u.id}_${idx}`,
                    friends: [f],
                    friendName: f.name,
                    friendImage: f.image
                });
            });
        } else {
            processed.push(u);
        }
    });
    return processed;
};

const Updates = () => {
    const [updates, setUpdates] = useState([]);
    const [loadedChunks, setLoadedChunks] = useState(new Set());
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const [loading, setLoading] = useState(true);
    const [totalCount, setTotalCount] = useState(0);
    const observer = useRef();

    const [friends, setFriends] = useState([]);
    const [communities, setCommunities] = useState([]);

    // Load a chunk dynamically
    const loadChunk = useCallback(async (chunkIndex) => {
        if (loadedChunks.has(chunkIndex)) return;

        try {
            const chunkData = await fetchJsonFromStorage(`orkut/chunks/updates_chunk_${chunkIndex}.json`);
            if (!chunkData) return;

            // Process and flatten the chunk data
            const processedData = processUpdates(chunkData).filter(u => u.type !== 'new_friend');

            setUpdates(prev => {
                const newUpdates = [...prev];
                const startIdx = chunkIndex * CHUNK_SIZE;
                processedData.forEach((item, idx) => {
                    newUpdates[startIdx + idx] = item;
                });
                return newUpdates;
            });

            setLoadedChunks(prev => new Set([...prev, chunkIndex]));

            // Update total count based on processed data
            if (chunkIndex === 0) {
                setTotalCount(processedData.length);
            } else {
                setTotalCount(prev => prev + processedData.length);
            }
        } catch (err) {
            console.error(`Failed to load chunk ${chunkIndex}:`, err);
        }
    }, [loadedChunks]);

    // Load initial data
    useEffect(() => {
        const init = async () => {
            const [friendsData, commsData] = await Promise.all([
                fetchJsonFromStorage('orkut/friends.json'),
                fetchJsonFromStorage('orkut/communities.json')
            ]);
            setFriends(friendsData || []);
            setCommunities(commsData || []);
            await loadChunk(0);
            setLoading(false);
        };
        init();
    }, []);

    // Load more chunks as user scrolls
    useEffect(() => {
        const neededChunk = Math.floor((visibleCount - 1) / CHUNK_SIZE);
        const nextChunk = neededChunk + 1;

        if (!loadedChunks.has(neededChunk)) {
            loadChunk(neededChunk);
        }
        if (nextChunk * CHUNK_SIZE < TOTAL_UPDATES && !loadedChunks.has(nextChunk)) {
            loadChunk(nextChunk);
        }
    }, [visibleCount, loadedChunks, loadChunk]);

    const lastElementRef = useCallback(node => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && visibleCount < TOTAL_UPDATES) {
                setVisibleCount(prev => prev + ITEMS_PER_PAGE);
            }
        }, { rootMargin: '400px' });
        if (node) observer.current.observe(node);
    }, [visibleCount]);

    // Reverse the loaded updates for display (newest first)
    const displayUpdates = useMemo(() => {
        return updates.filter(Boolean).slice(0, visibleCount).reverse();
    }, [updates, visibleCount]);

    const formatDate = (isoString) => {
        if (!isoString) return '';
        try {
            const date = new Date(isoString);
            if (date.getFullYear() === 1970) return '';
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            }) + ' ' + date.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return '';
        }
    };

    const renderUpdate = (update, index, isFirstInSlice) => {
        const ref = isFirstInSlice ? lastElementRef : null;

        let icon = null;
        let text = "";
        let img = null;

        switch (update.type) {
            case 'community_join': {
                let communityName = update.communityName;
                let communityPhoto = update.communityImage;

                if (communityName) {
                    const community = communities.find(c => c.name === communityName);
                    if (community && community.photo) {
                        communityPhoto = community.photo;
                    }
                } else {
                    const community = communities.find(c => c.photo === update.communityImage);
                    if (community) {
                        communityName = community.name;
                    }
                }

                img = communityPhoto;
                const displayName = communityName || 'uma comunidade';

                text = (
                    <div>
                        <div style={{ marginBottom: '2px' }}>Entrou na comunidade</div>
                        <div style={{ marginBottom: '4px' }}><b>{displayName}</b></div>
                        {update.communityDescription && (
                            <DescriptionBox>
                                {update.communityDescription}
                            </DescriptionBox>
                        )}
                    </div>
                );
                break;
            }
            case 'new_friend': {
                img = update.friendImage;
                const friend = friends.find(f => f.photo === img);
                text = <>Matheus José e <b>{friend ? friend.name : 'alguém'}</b> agora são amigos.</>;
                break;
            }
            case 'new_friend_aggregated': {
                const friends = update.friends || [];
                if (friends.length > 0) {
                    img = friends[0].image;
                    const firstFriend = friends[0].name;
                    const othersCount = friends.length - 1;

                    let othersText = null;
                    if (othersCount > 0) {
                        const pessoaString = othersCount === 1 ? 'pessoa' : 'pessoas';
                        othersText = <> e outros <b>{othersCount} {pessoaString}</b></>;
                    }

                    text = (
                        <div>
                            <div style={{ marginBottom: '2px' }}>Agora é amigo de</div>
                            <div style={{ marginBottom: '4px' }}>
                                <b>{firstFriend}</b>{othersText}.
                            </div>

                            {friends.length > 1 && (
                                <FriendsGrid>
                                    {friends.slice(1, 9).map((f, i) => (
                                        <SmallFriendImg
                                            key={i}
                                            path={resolveOrkutImage(f.image)}
                                            title={f.name}
                                            alt={f.name}
                                            loading="lazy"
                                        />
                                    ))}
                                </FriendsGrid>
                            )}
                        </div>
                    );

                } else if (update.friendName) {
                    img = update.friendImage;
                    text = (
                        <div>
                            <div style={{ marginBottom: '2px' }}>Agora é amigo de</div>
                            <div style={{ marginBottom: '4px' }}><b>{update.friendName}</b>.</div>
                        </div>
                    );
                } else {
                    icon = "👥";
                    text = <>Fez novos amigos.</>;
                }
                break;
            }
            case 'link': {
                img = update.linkImage;
                const linkTitle = update.linkTitle || 'um link';
                const action = update.actionText || 'compartilhou';
                text = <>Matheus José {action}: <b>{linkTitle}</b></>;
                break;
            }
            case 'photos_shared': {
                icon = "📷";
                const photoCount = update.photos ? update.photos.length : 0;
                text = (
                    <div>
                        Adicionou <b>{photoCount > 0 ? `${photoCount} fotos` : 'novas fotos'}</b>.
                    </div>
                );
                break;
            }
            case 'image_post': {
                img = update.imageUrl;
                text = (
                    <div>
                        Postou uma imagem.
                    </div>
                );
                break;
            }
            case 'new_fan':
                icon = "🌟";
                text = <>Agora é fã de <b>{update.content}</b></>;
                break;
            case 'video_like':
                icon = "❤️";
                text = <>Gostou de um vídeo.</>;
                break;
            case 'profile_update': {
                img = "user_thumb_medium.jpg";
                text = (
                    <div>
                        <div style={{ marginBottom: '2px' }}>Atualizou o perfil dele.</div>
                        {update.profileData && update.profileData.length > 0 ? (
                            <div style={{ marginBottom: '4px' }}>
                                {update.profileData.map((data, idx) => (
                                    <span key={idx}>
                                        {idx > 0 && ", "}
                                        {data.label}: <b>{data.value}</b>
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div style={{ marginBottom: '4px' }}>
                                <b>{update.content || "Atualizou o perfil."}</b>
                            </div>
                        )}
                    </div>
                );
                break;
            }
            default:
                if (update.content && update.content.includes('amigos')) {
                    icon = "👥";
                    text = <>Tem <b>{update.content}</b></>;
                } else if (update.content && update.content.includes('frase')) {
                    icon = "💬";
                    text = (
                        <div>
                            Mudou sua <b>frase do perfil</b>
                            {update.phrase && <Quote>"{update.phrase}"</Quote>}
                        </div>
                    );
                } else if (update.content === "") {
                    if (update.type === 'new_friend_aggregated') {
                        icon = "👥"; text = "Novos amigos";
                    } else {
                        icon = "📝";
                        text = <>Atualizou seu perfil.</>;
                    }
                } else {
                    icon = "🔔";
                    text = update.content;
                }
        }

        return (
            <UpdateItem key={update.id} ref={ref}>
                {img ? (
                    <UpdateImg
                        path={resolveOrkutImage(img)}
                        alt="update image"
                        loading="lazy"
                    />
                ) : (
                    <UpdateIcon>{icon || "📋"}</UpdateIcon>
                )}
                <UpdateContent>
                    <UpdateHeader>
                        <UpdateText style={{ flex: 1 }}>{text}</UpdateText>
                        <UpdateDate style={{ flexShrink: 0, marginTop: '2px' }}>
                            {formatDate(update.dateISO) || update.date || 'Sem data'}
                        </UpdateDate>
                    </UpdateHeader>
                </UpdateContent>
            </UpdateItem>
        );
    };

    if (loading) {
        return (
            <WhiteBox>
                <BoxTitle>minhas atualizações ({TOTAL_UPDATES})</BoxTitle>
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    carregando atualizações...
                </div>
            </WhiteBox>
        );
    }

    return (
        <WhiteBox>
            <BoxTitle>minhas atualizações ({TOTAL_UPDATES})</BoxTitle>
            <div style={{ padding: '0' }}>
                {displayUpdates.map((update, index) =>
                    renderUpdate(update, index, index === Math.max(0, displayUpdates.length - 5))
                )}

                {visibleCount < TOTAL_UPDATES && (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '11px' }}>
                        pegando mais atualizações...
                    </div>
                )}
            </div>
        </WhiteBox>
    );
};

export default Updates;
