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

const Gamertag = styled.span`
  font-weight: bold;
  font-size: 1.1rem;
`;

const Gamerscore = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
`;

const GIcon = styled.div`
  width: 14px;
  height: 14px;
  background-color: #107C10; /* Xbox Green */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 10px;
  font-weight: bold;
`;

const LastPlayedContainer = styled.div`
  padding: 5px 0;
  display: flex;
  flex-direction: column;
`;

const LastPlayedLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 8px;
`;

const GameInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const GameCover = styled.img`
  width: 50px;
  height: 50px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.borderDark};
  background: black;
`;

const GameTitle = styled.span`
  font-weight: bold;
  font-size: 0.95rem;
`;

const LoadingContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;
    gap: 10px;
`;

const XboxWindow = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchXboxData = async () => {
            try {
                const res = await fetch('/.netlify/functions/xbox');

                if (!res.ok) {
                    // Tentar ler o corpo do erro se for JSON
                    let errMsg = `Erro ${res.status}: ${res.statusText}`;
                    try {
                        const errJson = await res.json();
                        if (errJson.error) errMsg += ` - ${errJson.error}`;
                    } catch (e) {
                        // Ignora se não for JSON
                    }
                    throw new Error(errMsg);
                }

                const json = await res.json();
                if (json.error) throw new Error(json.error);

                setData(json);
            } catch (err) {
                console.error("Xbox API failed:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchXboxData();
    }, []);

    const getUserData = () => {
        if (!data || !data.account || !data.account.profileUsers || data.account.profileUsers.length === 0) return null;
        const user = data.account.profileUsers[0];

        const getSetting = (id) => user.settings.find(s => s.id === id)?.value;

        let lastGame = null;
        if (data.history && data.history.titles && data.history.titles.length > 0) {
            lastGame = data.history.titles[0];
        }

        return {
            gamertag: getSetting('Gamertag'),
            gamerscore: getSetting('Gamerscore'),
            avatar: getSetting('GameDisplayPicRaw'),
            lastGame: lastGame
        };
    };

    const userData = getUserData();

    return (
        <div style={{ padding: '0 5px' }}>
            {loading && (
                <LoadingContainer>
                    <p>Conectando ao Xbox Live...</p>
                    <ProgressBar width="100%" />
                </LoadingContainer>
            )}

            {error && !loading && (
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <p>Erro ao carregar informações.</p>
                    <p style={{ fontSize: '0.8em' }}>(Verifique as chaves de API no Netlify)</p>
                </div>
            )}

            {!loading && !error && userData && (
                <>
                    <ProfileContainer>
                        <AvatarImage src={userData.avatar} alt="Avatar" />
                        <InfoColumn>
                            <Gamertag>{userData.gamertag}</Gamertag>
                            <Gamerscore>
                                <GIcon>G</GIcon>
                                {userData.gamerscore}
                            </Gamerscore>
                        </InfoColumn>
                    </ProfileContainer>

                    {userData.lastGame && (
                        <>
                            <Divider style={{ margin: '10px 0' }} />
                            <LastPlayedContainer>
                                <LastPlayedLabel>Último Jogo:</LastPlayedLabel>
                                <GameInfo>
                                    <GameCover src={userData.lastGame.displayImage} alt={userData.lastGame.name} />
                                    <GameTitle>{userData.lastGame.name}</GameTitle>
                                </GameInfo>
                            </LastPlayedContainer>
                        </>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.8rem', paddingBottom: '10px' }}>
                        <Anchor href="https://www.xbox.com/pt-BR/play/user/matheusdobairro" target="_blank" style={{ textDecoration: 'none' }}>
                            @matheusdobairro no Xbox
                        </Anchor>
                    </div>
                </>
            )}
        </div>
    );
};

export default XboxWindow;
