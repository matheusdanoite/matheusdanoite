import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Divider, ProgressBar, Anchor } from 'react95';

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
`;

const AvatarImage = styled.img`
  width: 64px;
  height: 64px;
  border: 2px solid ${({ theme }) => theme.borderDarkest};
`;

const InfoColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const PersonaName = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
`;

const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.85rem;
  color: ${props => props.$color || props.theme.textSecondary};
`;

const StatusDot = styled.div`
  width: 10px;
  height: 10px;
  background-color: ${props => props.$color};
  border-radius: 50%;
  border: 1px solid black;
`;

const SectionLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 8px;
  display: block;
`;

const MetaInfo = styled.div`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  display: flex;
  gap: 10px;
  margin-top: 2px;
`;

const LevelBadge = styled.span`
    background: ${({ theme }) => theme.flatLight || '#dfdfdf'};
    border: 1px solid ${({ theme }) => theme.borderDarkest};
    padding: 1px 4px;
    border-radius: 2px;
    font-weight: bold;
    color: ${({ theme }) => theme.text};
`;

const GameList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const GameItem = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const GameIcon = styled.img`
    width: 24px;
    height: 24px;
`;

const GameName = styled.span`
    font-size: 0.9rem;
    font-weight: bold;
`;

const Playtime = styled.span`
    font-size: 0.8rem;
    margin-left: auto;
    color: ${({ theme }) => theme.textSecondary};
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap: 10px;
`;

const SteamWindow = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSteamData = async () => {
            try {
                const res = await fetch('/api/steam');
                if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
                const json = await res.json();
                if (json.error) throw new Error(json.error);
                setData(json);
            } catch (err) {
                console.error("Steam API failed:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSteamData();
    }, []);

    const getStatusInfo = (state) => {
        switch (state) {
            case 1: return { text: 'Online', color: '#57cbde' };
            case 2: return { text: 'Busy', color: '#e04539' };
            case 3: return { text: 'Away', color: '#f0ad4e' };
            default: return { text: 'Offline', color: '#898989' };
        }
    };

    if (loading) return (
        <LoadingContainer>
            <p>Conectando ao Steam...</p>
            <ProgressBar width="100%" />
        </LoadingContainer>
    );

    if (error) return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <p>Erro ao carregar Steam.</p>
            <p style={{ fontSize: '0.8em', color: '#ff4444' }}>{error}</p>
        </div>
    );

    const { profile, recentGames } = data;
    const status = getStatusInfo(profile.personaState);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    };

    return (
        <div style={{ padding: '10px' }}>
            <ProfileContainer>
                <AvatarImage src={profile.avatar} alt="Avatar" />
                <InfoColumn>
                    <PersonaName>{profile.personaname}</PersonaName>
                    <Status $color={status.color}>
                        <StatusDot $color={status.color} />
                        {profile.gameextrainfo ? `Jogando: ${profile.gameextrainfo}` : status.text}
                    </Status>
                    <MetaInfo>
                        <span>Nível: <LevelBadge>{profile.level}</LevelBadge></span>
                        {profile.timecreated && <span>Membro desde: {formatDate(profile.timecreated)}</span>}
                    </MetaInfo>
                </InfoColumn>
            </ProfileContainer>

            <Divider style={{ margin: '10px 0' }} />

            <SectionLabel>Últimos 3 Jogos:</SectionLabel>
            <GameList>
                {recentGames.length > 0 ? recentGames.slice(0, 3).map(game => (
                    <GameItem key={game.appid}>
                        <GameIcon src={`https://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`} alt={game.name} />
                        <GameName>{game.name}</GameName>
                        <Playtime>Total: {(game.playtime_forever / 60).toFixed(1)}h</Playtime>
                    </GameItem>
                )) : (
                    <p style={{ fontSize: '0.85rem' }}>Nenhum jogo recente.</p>
                )}
            </GameList>

            <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.8rem' }}>
                <Anchor href={profile.profileurl} target="_blank" style={{ textDecoration: 'none' }}>
                    matheusdanoite na Steam
                </Anchor>
            </div>
        </div>
    );
};

export default SteamWindow;
