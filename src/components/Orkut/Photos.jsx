import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { WhiteBox, BoxTitle, NavLink } from './OrkutLayout';
import { fetchJsonFromStorage } from '../../utils/storageLoader';
import FirebaseMedia from '../FirebaseMedia';

const getOrkutPhotoUrl = (albumName, photo) => {
  // Assuming structure: orkut/fotos/AlbumName/Photo
  // Need to handle if photo is just filename or full path inside album folder
  // Based on previous code implicitly using correct paths.
  // Let's assume consistent naming or check data.
  // Assuming 'photo' is filename like '1.jpg'.
  return `orkut/fotos/${albumName}/${photo}`;
};

const AlbumGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  padding: 20px 20px 40px 20px;
`;

const AlbumCard = styled.div`
  cursor: pointer;
  text-align: center;
`;

const AlbumCover = styled(FirebaseMedia)`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #ddd;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  background-color: #eee;
`;

const AlbumName = styled.div`
  font-size: 13px;
  color: #06c;
  font-weight: bold;
  margin-top: 8px;
  text-transform: capitalize;
  line-height: 1.4;
  padding: 0 4px 4px 4px;
  overflow-wrap: break-word;
`;

const PhotoCount = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 2px;
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  padding: 20px;
`;

const PhotoItem = styled(FirebaseMedia)`
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 2px;
  border: 1px solid #eee;
  cursor: pointer;
  background-color: #eee;
  
  &:hover {
    border-color: #06c;
  }
`;

const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh; /* Dynamic viewport height for iOS */
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3000;
  padding: 40px;
  box-sizing: border-box;

  @media (max-width: 600px) {
    padding: 20px 10px;
  }
`;

const slideInRight = `
  @keyframes slideInRight {
    from { transform: translateX(50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const slideInLeft = `
  @keyframes slideInLeft {
    from { transform: translateX(-50px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
`;

const LightboxContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
  max-height: 100%;
  animation: ${props => props.direction === 'next' ? 'slideInRight' : 'slideInLeft'} 0.3s ease-out;
  ${slideInRight}
  ${slideInLeft}
`;

const LightboxImg = styled(FirebaseMedia)`
  max-width: 100%;
  max-height: 100dvh;
  object-fit: contain;
  box-shadow: 0 0 20px rgba(0,0,0,0.5);
  cursor: default;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 10px;
  line-height: 1;
  
  &:hover {
    opacity: 0.8;
  }
`;

const Photos = () => {
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [navDirection, setNavDirection] = useState('next');
  const [touchStart, setTouchStart] = useState(null);
  const [albums, setAlbums] = useState([]);

  useEffect(() => {
    fetchJsonFromStorage('orkut/photos.json').then(data => setAlbums(data || []));
  }, []);

  const closeLightbox = () => setSelectedPhotoIndex(null);

  const nextPhoto = () => {
    if (!selectedAlbum) return;
    setNavDirection('next');
    setSelectedPhotoIndex((prev) => (prev + 1) % selectedAlbum.photos.length);
  };

  const prevPhoto = () => {
    if (!selectedAlbum) return;
    setNavDirection('prev');
    setSelectedPhotoIndex((prev) => (prev - 1 + selectedAlbum.photos.length) % selectedAlbum.photos.length);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedPhotoIndex === null) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowRight') {
        nextPhoto();
      } else if (e.key === 'ArrowLeft') {
        prevPhoto();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhotoIndex, selectedAlbum]);

  // Swipe Navigation
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const distance = touchStart - touchEnd;

    if (distance > 50) {
      nextPhoto();
    } else if (distance < -50) {
      prevPhoto();
    }
    setTouchStart(null);
  };

  useEffect(() => {
    if (selectedPhotoIndex !== null) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedPhotoIndex]);

  if (selectedAlbum) {
    return (
      <WhiteBox>
        <BoxTitle>{selectedAlbum.albumName}</BoxTitle>
        <PhotoGrid>
          {selectedAlbum.photos.map((photo, idx) => (
            <PhotoItem
              key={idx}
              path={getOrkutPhotoUrl(selectedAlbum.albumName, photo)}
              alt={`${selectedAlbum.albumName} - ${idx}`}
              onClick={() => {
                setSelectedPhotoIndex(idx);
                setNavDirection('next');
              }}
            />
          ))}
        </PhotoGrid>

        {selectedPhotoIndex !== null && (
          <LightboxOverlay
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <CloseButton onClick={closeLightbox}>&times;</CloseButton>
            <LightboxContent
              key={selectedPhotoIndex}
              direction={navDirection}
              onClick={(e) => e.stopPropagation()}
            >
              <LightboxImg
                path={getOrkutPhotoUrl(selectedAlbum.albumName, selectedAlbum.photos[selectedPhotoIndex])}
                alt="View"
              />
            </LightboxContent>
          </LightboxOverlay>
        )}
      </WhiteBox>
    );
  }

  return (
    <WhiteBox>
      <BoxTitle>álbuns de fotos ({albums.length})</BoxTitle>
      <AlbumGrid>
        {albums.map((album) => (
          <AlbumCard key={album.id || album.albumName} onClick={() => setSelectedAlbum(album)}>
            <AlbumCover
              path={getOrkutPhotoUrl(album.albumName, album.photos[0])}
              alt={album.albumName}
            />
            <AlbumName>{album.albumName}</AlbumName>
            <PhotoCount>{album.photos.length} fotos</PhotoCount>
          </AlbumCard>
        ))}
      </AlbumGrid>
    </WhiteBox>
  );
};

export default Photos;
