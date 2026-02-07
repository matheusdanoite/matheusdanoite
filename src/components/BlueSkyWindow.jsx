import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Hourglass, Anchor } from 'react95';
import BlueSkyPost from './BlueSkyPost';

const PostList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

// ... (omitting middle parts, will use multiple chunks if needed, but replace_file_content supports single chunk replacement too. Let's do multi-replace if we can't context match well, but here I can match bigger block or use multi_replace. Let's use multi_replace for safety as edits are far apart).

// Actually, I will use multi_replace_file_content since the edits are far apart (PostList at top, Footer at bottom).

// ... (PostList styled component remains) ...

const BlueSkyWindow = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await fetch('https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=matheusdanoite.com&limit=5');
                if (!response.ok) throw new Error('Failed to fetch');

                const data = await response.json();
                setPosts(data.feed || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError(true);
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}><Hourglass size={32} /></div>;

    if (error) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Erro ao carregar posts.</p>
        </div>
    );

    return (
        <div style={{ height: 'auto', paddingBottom: '10px', background: 'transparent' }}>
            <PostList>
                {posts.map((item, index) => (
                    <BlueSkyPost key={index} post={item.post} />
                ))}
            </PostList >
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '0.8rem' }}>
                <Anchor href="https://bsky.app/profile/matheusdanoite.com" target="_blank" style={{ textDecoration: 'none' }}>
                    @matheusdanoite.com no BlueSky
                </Anchor>
            </div>
        </div >
    );
};

export default BlueSkyWindow;
