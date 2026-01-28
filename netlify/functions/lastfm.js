exports.handler = async function (event, context) {
    const API_KEY = process.env.LASTFM_API_KEY;
    const USERNAME = process.env.LASTFM_USERNAME;
    const LIMIT = 5;

    if (!API_KEY || !USERNAME) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Environment variables not collected.' }),
        };
    }

    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${USERNAME}&api_key=${API_KEY}&format=json&limit=${LIMIT}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return { statusCode: response.status, body: response.statusText };
        }
        const data = await response.json();

        // Simplifies data to send only what is necessary to the frontend
        const tracks = data.recenttracks.track.map(track => ({
            name: track.name,
            artist: track.artist['#text'],
            album: track.album['#text'],
            image: track.image[1]['#text'], // Medium size
            url: track.url,
            nowPlaying: track['@attr']?.nowplaying === 'true'
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // allow localhost dev
            },
            body: JSON.stringify(tracks),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed fetching data' }),
        };
    }
};
