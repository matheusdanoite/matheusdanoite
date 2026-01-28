import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Anchor, Cutout, Hourglass } from 'react95';

const TrackList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const TrackItem = styled.li`
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 2px solid transparent; // spacer
    
    &:hover {
        background: ${({ theme }) => theme.hoverBackground};
        color: ${({ theme }) => theme.canvasTextInvert};
    }
`;

const CoverImage = styled.img`
    width: 40px;
    height: 40px;
    margin-right: 12px;
    border: 2px solid ${({ theme }) => theme.borderDark};
`;

const TrackInfo = styled.div`
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;

const TrackName = styled.span`
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ArtistName = styled.span`
    font-size: 0.8rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const MusicWindow = () => {
    const [tracks, setTracks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        // Defines the API URL. In production (GitHub Pages), this MUST be the full URL of your Netlify site.
        // Example: https://meu-portfolio.netlify.app/.netlify/functions/lastfm
        const API_BASE = import.meta.env.VITE_NETLIFY_URL || '';
        const FUNCTION_URL = `${API_BASE}/.netlify/functions/lastfm`;

        fetch(FUNCTION_URL)
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setTracks(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(true);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}><Hourglass size={32} /></div>;

    if (error) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Erro ao carregar músicas.</p>
            <p style={{ fontSize: '0.8em' }}>(Verifique as chaves de API no Netlify)</p>
        </div>
    );

    return (
        <Cutout style={{ height: '300px', overflowY: 'auto', background: 'white' }}>
            <TrackList>
                {tracks.map((track, index) => (
                    <TrackItem key={index}>
                        {track.image && <CoverImage src={track.image} alt="Capa" />}
                        <TrackInfo>
                            <TrackName>
                                <Anchor href={track.url} target="_blank" style={{ textDecoration: 'none', cursor: 'pointer' }}>
                                    {track.name}
                                </Anchor>
                            </TrackName>
                            <ArtistName>
                                {track.artist} {track.nowPlaying && <span style={{ color: 'red', fontWeight: 'bold' }}> (Ouvindo agora)</span>}
                            </ArtistName>
                        </TrackInfo>
                    </TrackItem>
                ))}
            </TrackList>
        </Cutout>
    );
};

export default MusicWindow;
