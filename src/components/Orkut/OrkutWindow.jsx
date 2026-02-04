import React, { useState } from 'react';
import {
    OrkutContainer,
    MainContainer,
    LeftColumn,
    ContentColumn,
    RightColumn,
    WhiteBox,
    UserName,
    ProfilePicture,
    NavLink,
    BoxTitle,
    MobileTopBar,
    MobileProfilePhoto,
    MobileUserInfo,
    MobileUserName,
    MobileActiveTab,
    MobileChevron,
    MobileMenu,
    MobileNavItem
} from './OrkutLayout';
import Scraps from './Scraps';
import Testimonials from './Testimonials';
import { FriendsList, CommunitiesList } from './Lists';
import Updates from './Updates';
import Topics from './Topics';
import Photos from './Photos';

import { resolveOrkutImage } from '../../utils/orkutImageLoader';
import { fetchJsonFromStorage } from '../../utils/storageLoader';

import useIsMobile from '../../utils/useIsMobile';



const tabLabels = {
    perfil: 'perfil',
    atualizacoes: 'minhas atualizações',
    scraps: 'página de recados',
    depoimentos: 'depoimentos',
    topicos: 'tópicos',
    fotos: 'fotos'
};

const OrkutWindow = () => {
    const [activeTab, setActiveTab] = useState('perfil');
    const [refreshKey, setRefreshKey] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const isMobile = useIsMobile();
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        fetchJsonFromStorage('orkut/profile.json').then(data => setProfileData(data || {}));
    }, []);

    const handleTabClick = (tab) => {
        if (activeTab === tab) {
            setRefreshKey(prev => prev + 1);
        } else {
            setActiveTab(tab);
            setRefreshKey(0); // Reset for new tab
        }
        setMobileMenuOpen(false); // Close menu after selection
    };

    const renderProfileSection = (title, items) => (
        <div style={{ marginBottom: '20px' }}>
            <div style={{ color: '#5778A1', fontWeight: 'bold', borderBottom: '1px solid #BCCDE9', marginBottom: '8px', paddingBottom: '3px', fontSize: '12px' }}>
                {title}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px' }}>
                {items.map((item, idx) => (
                    <div key={idx} style={{ fontSize: '13px', display: 'flex', gap: '5px' }}>
                        <b style={{ color: '#6d84b4', minWidth: '80px', whiteSpace: 'pre-line' }}>{item.label}:</b>
                        <span style={{ color: '#333' }}>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderActiveContent = () => {
        switch (activeTab) {
            case 'scraps':
                return <Scraps />;
            case 'depoimentos':
                return <Testimonials />;
            case 'topicos':
                return <Topics />;
            case 'fotos':
                return <Photos />;
            case 'amigos':
                return <FriendsList />;
            case 'comunidades':
                return <CommunitiesList />;
            case 'atualizacoes':
                return <Updates />;
            case 'perfil':
            default:
                return (
                    <>
                        <WhiteBox>
                            <BoxTitle>{profileData ? profileData.name : 'Carregando...'}</BoxTitle>
                            <div style={{ padding: '20px' }}>
                                {profileData && (
                                    <>
                                        <ProfilePicture src={resolveOrkutImage(profileData.photo)} alt="Profile" />
                                        <div style={{ marginTop: '10px' }}>
                                            {renderProfileSection('Social', [
                                                { label: "relacionamento", value: profileData.relationship },
                                                { label: "aniversário", value: profileData.birthday },
                                                { label: "local", value: profileData.location },
                                                ...(profileData.social || [])
                                            ])}
                                            {renderProfileSection('Profissional', profileData.professional)}
                                            {renderProfileSection('Pessoal', profileData.personal)}
                                            {renderProfileSection('Detalhes', profileData.details)}
                                        </div>
                                    </>
                                )}
                                <div style={{ marginTop: '25px' }}>
                                    <div style={{ color: '#5778A1', fontWeight: 'bold', borderBottom: '1px solid #BCCDE9', marginBottom: '12px', paddingBottom: '4px', fontSize: '12px' }}>
                                        Sobre {profileData && profileData.name ? profileData.name.split(' ')[0] : 'mim'}
                                    </div>
                                    <div style={{ fontSize: '13px', lineHeight: '1.5', color: '#444', textAlign: 'justify' }}>
                                        {profileData ? profileData.aboutMe : 'Carregando...'}
                                    </div>
                                </div>
                            </div>
                        </WhiteBox>
                    </>
                );
        }
    };

    const FriendsBox = () => (
        <WhiteBox style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            <BoxTitle>amigos ({ORKUT_FRIENDS.length})</BoxTitle>
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 5px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '33.33% 33.33% 33.33%', gap: '10px 0' }}>
                    {ORKUT_FRIENDS.map(friend => (
                        <div key={friend.id} style={{ textAlign: 'center', minWidth: 0 }}>
                            <img
                                src={resolveOrkutImage(friend.photo)}
                                alt={friend.name}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd' }}
                            />
                            <div style={{ fontSize: '11px', marginTop: '4px', color: '#06c', padding: '0 4px', lineHeight: '1.2', wordBreak: 'break-word' }}>
                                {friend.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </WhiteBox>
    );

    const CommunitiesBox = () => (
        <WhiteBox style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
            <BoxTitle>comunidades ({ORKUT_COMMUNITIES.length})</BoxTitle>
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 5px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '33.33% 33.33% 33.33%', gap: '10px 0' }}>
                    {ORKUT_COMMUNITIES.map(comm => (
                        <div key={comm.id} style={{ textAlign: 'center', minWidth: 0 }}>
                            <img
                                src={resolveOrkutImage(comm.photo)}
                                alt={comm.name}
                                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', border: '1px solid #ddd' }}
                            />
                            <div style={{ fontSize: '11px', marginTop: '4px', color: '#06c', padding: '0 4px', lineHeight: '1.2', wordBreak: 'break-word' }}>
                                {comm.name}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </WhiteBox>
    );

    return (
        <OrkutContainer>
            {/* Mobile Navigation Bar */}
            {isMobile && (
                <>
                    <MobileTopBar onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        <MobileProfilePhoto
                            src={resolveOrkutImage('user_thumb_medium.jpg')}
                            alt={profileData.name}
                        />
                        <MobileUserInfo>
                            <MobileUserName>{profileData.name}</MobileUserName>
                            <MobileActiveTab>{tabLabels[activeTab]}</MobileActiveTab>
                        </MobileUserInfo>
                        <MobileChevron $expanded={mobileMenuOpen}>▼</MobileChevron>
                    </MobileTopBar>
                    <MobileMenu $expanded={mobileMenuOpen}>
                        <MobileNavItem $active={activeTab === 'perfil'} onClick={() => handleTabClick('perfil')}>perfil</MobileNavItem>
                        <MobileNavItem $active={activeTab === 'atualizacoes'} onClick={() => handleTabClick('atualizacoes')}>atualizações</MobileNavItem>
                        <MobileNavItem $active={activeTab === 'scraps'} onClick={() => handleTabClick('scraps')}>recados</MobileNavItem>
                        <MobileNavItem $active={activeTab === 'depoimentos'} onClick={() => handleTabClick('depoimentos')}>depoimentos</MobileNavItem>
                        <MobileNavItem $active={activeTab === 'topicos'} onClick={() => handleTabClick('topicos')}>tópicos</MobileNavItem>
                        <MobileNavItem $active={activeTab === 'fotos'} onClick={() => handleTabClick('fotos')}>fotos</MobileNavItem>
                    </MobileMenu>
                </>
            )}

            <MainContainer>
                {/* Desktop Sidebar - hidden on mobile */}
                {!isMobile && (
                    <LeftColumn>
                        <WhiteBox style={{ padding: '15px' }}>
                            <ProfilePicture src={resolveOrkutImage('user_thumb_medium.jpg')} alt="Matheus José" />
                            <UserName>{profileData.name}</UserName>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '15px' }}>
                                <NavLink onClick={() => handleTabClick('perfil')} active={activeTab === 'perfil'}>perfil</NavLink>
                                <NavLink onClick={() => handleTabClick('atualizacoes')} active={activeTab === 'atualizacoes'}>atualizações</NavLink>
                                <NavLink onClick={() => handleTabClick('scraps')} active={activeTab === 'scraps'}>recados</NavLink>
                                <NavLink onClick={() => handleTabClick('depoimentos')} active={activeTab === 'depoimentos'}>depoimentos</NavLink>
                                <NavLink onClick={() => handleTabClick('topicos')} active={activeTab === 'topicos'}>tópicos</NavLink>
                                <NavLink onClick={() => handleTabClick('fotos')} active={activeTab === 'fotos'}>fotos</NavLink>
                            </div>
                        </WhiteBox>
                    </LeftColumn>
                )}

                <ContentColumn key={`${activeTab}-${refreshKey}`}>
                    {renderActiveContent()}

                    {/* Mobile: Render Friends and Communities below profile */}
                    {isMobile && activeTab === 'perfil' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <FriendsBox />
                            <CommunitiesBox />
                        </div>
                    )}
                </ContentColumn>

                {activeTab === 'perfil' && (
                    <RightColumn>
                        <FriendsBox />
                        <CommunitiesBox />
                    </RightColumn>
                )}
            </MainContainer>
        </OrkutContainer>
    );
};

export default OrkutWindow;
