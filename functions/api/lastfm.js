export async function onRequest(context) {
    const API_KEY = context.env.LASTFM_API_KEY;
    const USERNAME = context.env.LASTFM_USERNAME;
    const LIMIT = 5;

    // Set common headers
    const commonHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    };

    if (!API_KEY || !USERNAME) {
        return new Response(JSON.stringify({
            error: 'CONFIG_ERROR: Variáveis de ambiente (LASTFM_API_KEY ou LASTFM_USERNAME) não configuradas no Cloudflare.'
        }), {
            status: 500,
            headers: commonHeaders
        });
    }

    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=${LIMIT}`;

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'MeuPortfolio/1.0 (Cloudflare Worker)'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            return new Response(JSON.stringify({
                error: `LASTFM_API_ERROR (${response.status}): ${errText.slice(0, 100)}`
            }), {
                status: response.status,
                headers: commonHeaders
            });
        }

        const data = await response.json();

        if (!data.recenttracks || !data.recenttracks.track) {
            return new Response(JSON.stringify({
                error: 'DATA_FORMAT_ERROR: Resposta inesperada do Last.fm',
                received: Object.keys(data)
            }), {
                status: 500,
                headers: commonHeaders
            });
        }

        const trackData = Array.isArray(data.recenttracks.track)
            ? data.recenttracks.track
            : [data.recenttracks.track];

        const tracks = trackData.map(track => ({
            name: track.name || 'Unknown Track',
            artist: track.artist ? track.artist['#text'] : 'Unknown Artist',
            album: track.album ? track.album['#text'] : 'Unknown Album',
            image: (track.image && track.image.length > 1) ? track.image[1]['#text'] : '',
            url: track.url || '#',
            nowPlaying: track['@attr']?.nowplaying === 'true'
        }));

        return new Response(JSON.stringify(tracks), {
            status: 200,
            headers: commonHeaders
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: `INTERNAL_ERROR: ${error.message}` }), {
            status: 500,
            headers: commonHeaders
        });
    }
}
