export async function onRequest(context) {
    const STEAM_API_KEY = context.env.STEAM_API_KEY?.trim();
    const STEAM_ID = context.env.STEAM_ID?.trim();

    const commonHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-Backend-Function': 'steam-active'
    };

    if (!STEAM_API_KEY || !STEAM_ID) {
        return new Response(JSON.stringify({
            error: 'CONFIG_ERROR: Variáveis de ambiente (STEAM_API_KEY ou STEAM_ID) não configuradas no Cloudflare.'
        }), {
            status: 500,
            headers: commonHeaders
        });
    }

    try {
        // 1. Get Player Summaries (includes timecreated)
        const summaryUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${encodeURIComponent(STEAM_API_KEY)}&steamids=${encodeURIComponent(STEAM_ID)}`;
        const summaryRes = await fetch(summaryUrl);
        const summaryData = await summaryRes.json();

        // 2. Get Owned Games (to ensure we have at least 3 games)
        // include_appinfo=1: get name and icon
        // include_played_free_games=1: include free games
        const ownedGamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${encodeURIComponent(STEAM_API_KEY)}&steamid=${encodeURIComponent(STEAM_ID)}&include_appinfo=1&include_played_free_games=1&format=json`;
        const ownedRes = await fetch(ownedGamesUrl);
        const ownedData = await ownedRes.json();

        // 3. Get Steam Level
        const levelUrl = `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${encodeURIComponent(STEAM_API_KEY)}&steamid=${encodeURIComponent(STEAM_ID)}`;
        const levelRes = await fetch(levelUrl);
        const levelData = await levelRes.json();

        const player = summaryData.response.players[0] || {};
        const allGames = ownedData.response.games || [];
        const level = levelData.response.player_level || 0;

        // Sort by last played time (descending) and take top 3
        const games = allGames
            .sort((a, b) => b.rtime_last_played - a.rtime_last_played)
            .slice(0, 3)
            .map(game => ({
                name: game.name,
                playtime_forever: game.playtime_forever,
                img_icon_url: game.img_icon_url,
                appid: game.appid
            }));

        return new Response(JSON.stringify({
            profile: {
                personaname: player.personaname,
                profileurl: player.profileurl,
                avatar: player.avatarfull,
                personaState: player.personastate,
                gameextrainfo: player.gameextrainfo,
                timecreated: player.timecreated,
                level: level
            },
            recentGames: games
        }), {
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
