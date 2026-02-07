import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Divider, ProgressBar } from 'react95';

const DiscordContainer = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const UserHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
`;

const Avatar = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 50%;
`;

const StatusBadge = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 14px;
  height: 14px;
  background-color: ${props => props.$color};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.flatLight || '#c6c6c6'};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Username = styled.span`
  font-weight: bold;
  font-size: 1rem;
`;

const CustomStatus = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.textSecondary};
  font-style: italic;
`;

const ActivitySection = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    background: ${({ theme }) => theme.flatLight || 'rgba(255, 255, 255, 0.1)'};
    padding: 8px;
    border: 1px inset ${({ theme }) => theme.borderDark};
`;

const ActivityHeader = styled.span`
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    color: ${({ theme }) => theme.textSecondary};
`;

const ActivityContent = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;
`;

const ActivityImage = styled.img`
    width: 40px;
    height: 40px;
    border-radius: 4px;
`;

const ActivityText = styled.div`
    display: flex;
    flex-direction: column;
`;

const ActivityTitle = styled.span`
    font-size: 0.85rem;
    font-weight: bold;
`;

const ActivitySub = styled.span`
    font-size: 0.8rem;
`;

const DiscordWindow = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const userId = "263686183580729354";

    useEffect(() => {
        const fetchLanyard = async () => {
            try {
                const res = await fetch(`https://api.lanyard.rest/v1/users/${userId}`);
                const json = await res.json();
                if (json.success) setData(json.data);
            } catch (err) {
                console.error("Lanyard failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLanyard();
        const interval = setInterval(fetchLanyard, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#43b581';
            case 'idle': return '#faa61a';
            case 'dnd': return '#f04747';
            default: return '#747f8d';
        }
    };

    if (loading) return (
        <div style={{ padding: '20px' }}>
            <ProgressBar variant="tile" />
        </div>
    );

    if (!data) return <div style={{ padding: '20px' }}>Erro ao carregar Discord.</div>;

    const statusColor = data ? getStatusColor(data.discord_status) : getStatusColor('online');

    // Use dummy data if no real data is available (for layout verification)
    const effectiveData = data || {
        discord_user: {
            username: "Matheus José",
            avatar: "dummy_avatar",
            global_name: "Matheus José"
        },
        activities: [
            {
                type: 0,
                name: "Visual Studio Code",
                details: "Editing Redes.jsx",
                state: "Workspace: meu-portfolio",
                assets: { large_image: "vscode" }
            }
        ],
        spotify: {
            track: "Dummy Track",
            artist: "Dummy Artist",
            album_art_url: "https://placehold.co/64"
        }
    };

    const game = effectiveData.activities.find(a => a.type === 0);
    const spotify = effectiveData.spotify;

    return (
        <DiscordContainer>
            <UserHeader>
                <AvatarWrapper>
                    {data ? (
                        <Avatar src={`https://cdn.discordapp.com/avatars/${userId}/${effectiveData.discord_user.avatar}.png`} />
                    ) : (
                        <Avatar src="https://placehold.co/48" />
                    )}
                    <StatusBadge $color={statusColor} />
                </AvatarWrapper>
                <UserInfo>
                    <Username>{effectiveData.discord_user.global_name || effectiveData.discord_user.username}</Username>
                    {effectiveData.activities.find(a => a.type === 4) && (
                        <CustomStatus>{effectiveData.activities.find(a => a.type === 4).state}</CustomStatus>
                    )}
                </UserInfo>
            </UserHeader>

            {game && (
                <ActivitySection>
                    <ActivityHeader>Jogando</ActivityHeader>
                    <ActivityContent>
                        {game.assets?.large_image ? (
                            data ? <ActivityImage src={`https://cdn.discordapp.com/app-assets/${game.application_id}/${game.assets.large_image}.png`} />
                                : <ActivityImage src="https://placehold.co/40" />
                        ) : null}
                        <ActivityText>
                            <ActivityTitle>{game.name}</ActivityTitle>
                            {game.details && <ActivitySub>{game.details}</ActivitySub>}
                            {game.state && <ActivitySub>{game.state}</ActivitySub>}
                        </ActivityText>
                    </ActivityContent>
                </ActivitySection>
            )}

            {spotify && (
                <ActivitySection>
                    <ActivityHeader>Ouvindo Spotify</ActivityHeader>
                    <ActivityContent>
                        <ActivityImage src={spotify.album_art_url} />
                        <ActivityText>
                            <ActivityTitle>{spotify.track}</ActivityTitle>
                            <ActivitySub>por {spotify.artist}</ActivitySub>
                        </ActivityText>
                    </ActivityContent>
                </ActivitySection>
            )}

            {!game && !spotify && (
                <div style={{ fontSize: '0.8rem', textAlign: 'center', color: '#888', padding: '10px' }}>
                    Nenhuma atividade no momento.
                </div>
            )}
        </DiscordContainer>
    );
};

export default DiscordWindow;
