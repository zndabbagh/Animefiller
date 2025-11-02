const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const manifest = {
    id: 'community.anime.filler.detector',
    version: '1.0.0',
    name: 'Anime Filler Detector',
    description: 'Marks filler episodes for anime series using community data',
    resources: ['meta'],
    types: ['series'],
    catalogs: [],
    idPrefixes: ['tt', 'kitsu']
};

const builder = new addonBuilder(manifest);
const fillerCache = new Map();

async function getAnimeName(id) {
    const knownMappings = {
        'tt0409591': 'naruto',
        'tt0988824': 'naruto-shippuden',
        'tt2560140': 'one-piece',
        'tt1355642': 'bleach',
        'tt5626028': 'my-hero-academia',
        'tt2098220': 'attack-on-titan',
        'tt0805564': 'detective-conan',
        'tt0388629': 'case-closed'
    };
    return knownMappings[id] || null;
}

async function getFillerData(animeName) {
    if (fillerCache.has(animeName)) {
        return fillerCache.get(animeName);
    }
    const fillerData = fetchFillerList(animeName);
    fillerCache.set(animeName, fillerData);
    return fillerData;
}

function expandRanges(rangeStr) {
    const episodes = [];
    const parts = rangeStr.split(',').map(s => s.trim());
    for (const part of parts) {
        if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
                episodes.push(i);
            }
        } else {
            episodes.push(Number(part));
        }
    }
    return episodes;
}

function fetchFillerList(animeName) {
    const data = {
        'naruto': {
            filler: [26, 97, 101, 102, 103, 104, 105, 106, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220],
            mixed: [27, 185, 189]
        },
        'detective-conan': {
            filler: expandRanges('6,14,17,19,21,24-26,29-30,33,36-37,41,44-45,47,51,53,55-56,59,61-62,64-67,71,73-74,79-80,83,87-90,92-95,97,106-111,119-120,123-127,135,140,143,148-152,155,158-161,165,169,175,179-187,196-198,201-204,207-211,214-216,225,232,235-237,245,248,251-252,255-257,260-262,264-265,273,276,281-283,294-300,303,314-315,318-322,328,337,342,348-349,352-353,357,360,363-365,368-370,373,376-380,384,388-389,392-393,397,403-405,409-410,413-414,418-420,423-424,426,433-434,437,439-442,448,450-452,456,459,461,468,471,475,478,480,483,486,489,512,518-520,527,536,539-541,544,547-548,553-556,562,565-567,570,577,582,588,591,594-596,599,602-607,629-631,634-641,658,663-666,669-670,677-680,686-689,692-698,707-709,716-721,726,729-730,733,735-737,742-743,750,753,757-758,761-762,767-769,774-778,784,789-791,794-807,813,816-821,824-826,829,833-835,838-842,845-846'),
            mixed: []
        },
        'case-closed': {
            filler: expandRanges('6,14,17,19,21,24-26,29-30,33,36-37,41,44-45,47,51,53,55-56,59,61-62,64-67,71,73-74,79-80,83,87-90,92-95,97,106-111,119-120,123-127,135,140,143,148-152,155,158-161,165,169,175,179-187,196-198,201-204,207-211,214-216,225,232,235-237,245,248,251-252,255-257,260-262,264-265,273,276,281-283,294-300,303,314-315,318-322,328,337,342,348-349,352-353,357,360,363-365,368-370,373,376-380,384,388-389,392-393,397,403-405,409-410,413-414,418-420,423-424,426,433-434,437,439-442,448,450-452,456,459,461,468,471,475,478,480,483,486,489,512,518-520,527,536,539-541,544,547-548,553-556,562,565-567,570,577,582,588,591,594-596,599,602-607,629-631,634-641,658,663-666,669-670,677-680,686-689,692-698,707-709,716-721,726,729-730,733,735-737,742-743,750,753,757-758,761-762,767-769,774-778,784,789-791,794-807,813,816-821,824-826,829,833-835,838-842,845-846'),
            mixed: []
        }
    };
    return data[animeName] || { filler: [], mixed: [] };
}

builder.defineMetaHandler(async ({ type, id }) => {
    if (type !== 'series') {
        return { meta: {} };
    }
    const animeName = await getAnimeName(id);
    if (!animeName) {
        return { meta: {} };
    }
    const fillerData = await getFillerData(animeName);
    if (!fillerData) {
        return { meta: {} };
    }
    const meta = {
        id: id,
        type: 'series',
        name: animeName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        videos: []
    };
    const totalEpisodes = Math.max(...fillerData.filler, ...fillerData.mixed, 850);
    for (let i = 1; i <= totalEpisodes; i++) {
        let title = `Episode ${i}`;
        let description = '';
        if (fillerData.filler.includes(i)) {
            title = `FILLER - Episode ${i}`;
            description = 'This is a filler episode (not part of the main story)';
        } else if (fillerData.mixed.includes(i)) {
            title = `MIXED - Episode ${i}`;
            description = 'This episode contains both filler and canon content';
        } else {
            title = `CANON - Episode ${i}`;
            description = 'This episode is part of the main storyline';
        }
        meta.videos.push({
            id: `${id}:1:${i}`,
            title: title,
            episode: i,
            season: 1,
            description: description,
            released: new Date().toISOString()
        });
    }
    return { meta };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });
console.log(`Anime Filler Detector addon running on port ${port}`);
