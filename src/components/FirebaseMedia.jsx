import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { getStorageUrl } from '../utils/storageLoader';

const Placeholder = styled.div`
  width: 100%;
  height: 100%;
  background-color: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
`;

const StyledImg = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  display: block;
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  opacity: ${props => props.$loaded ? 1 : 0};
  transition: opacity 0.3s;
`;

const StyledVideo = styled.video`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: ${props => props.$objectFit || 'cover'};
  opacity: ${props => props.$loaded ? 1 : 0};
  transition: opacity 0.3s;
`;

const FirebaseMedia = React.forwardRef(({ path, type = 'image', alt, className, controls, autoPlay, loop, muted, objectFit, showPlaceholder = true, ...props }, ref) => {
    const [src, setSrc] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;

        const loadsrc = async () => {
            setLoading(true);
            setError(false);
            try {
                const url = await getStorageUrl(path);
                if (active) {
                    if (url) {
                        setSrc(url);
                    } else {
                        setError(true);
                    }
                }
            } catch (e) {
                console.error("Error loading media:", path, e);
                if (active) setError(true);
            }
        };

        if (path) {
            loadsrc();
        }

        return () => { active = false; };
    }, [path]);

    const handleLoad = () => setLoading(false);
    const handleError = () => {
        setLoading(false);
        setError(true);
    };

    // Merged ref callback to handle both parent ref and our internal checks
    const handleRef = (node) => {
        // Forward the ref to parent
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }

        // Internal check for image visibility (Opacity Fix)
        if (type !== 'video' && node && node.complete && loading) {
            handleLoad();
        }
    };

    if (!path) return <Placeholder className={className} />;

    // Safe handlers that merge internal logic with prop callbacks
    const handleImageLoad = (e) => {
        handleLoad();
        if (props.onLoad) props.onLoad(e);
    };

    const handleVideoLoadedData = (e) => {
        handleLoad();
        if (props.onLoadedData) props.onLoadedData(e);
    };

    const handleMediaError = (e) => {
        handleError();
        if (props.onError) props.onError(e);
    };

    // Destructure props to avoid overwriting our handlers with ...props
    // and to not pass invalid props to DOM elements if any
    const { onLoad, onLoadedData, onError: propOnError, ...restProps } = props;

    if (!path) return <Placeholder className={className} />;

    if (error && !src) return <Placeholder className={className}>Erro</Placeholder>;

    return (
        <>
            {loading && showPlaceholder && <Placeholder className={className} />}
            {type === 'video' ? (
                <StyledVideo
                    src={src}
                    className={className}
                    $loaded={!loading}
                    $objectFit={objectFit}
                    onLoadedData={handleVideoLoadedData}
                    onError={handleMediaError}
                    controls={controls}
                    autoPlay={autoPlay}
                    loop={loop}
                    muted={muted}
                    playsInline
                    ref={handleRef}
                    {...restProps}
                />
            ) : (
                <StyledImg
                    src={src}
                    alt={alt || "Media"}
                    className={className}
                    $loaded={!loading}
                    $objectFit={objectFit}
                    onLoad={handleImageLoad}
                    onError={handleMediaError}
                    ref={handleRef}
                    {...restProps}
                />
            )}
        </>
    );
});

export default FirebaseMedia;
