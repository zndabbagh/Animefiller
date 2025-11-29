const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const manifest = {
    id: 'org.animefiller',
    version: '2.0.0',
    name: 'Anime Filler Info',
    description: 'Shows if anime episodes are filler or canon',
    resources: ['stream'],
    types: ['series'],
    catalogs: [],
    idPrefixes: ['tt']
};

const builder = new addonBuilder(manifest);

const animeMappings = {
    'tt0409591': 'naruto',
    'tt0988824': 'naruto-shippuden',
    'tt2560140': 'one-piece',
    'tt0434665': 'bleach',
    'tt5626028': 'my-hero-academia',
    'tt2098220': 'attack-on-titan',
    'tt0131179': 'detective-conan',
    'tt0131179': 'case-closed'
};

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

// -------------------------
// Case Closed / Detective Conan season mapping
// -------------------------
const caseClosedMapping = {
    1: 1, 2: 29, 3: 55, 4: 83, 5: 111, 6: 139, 7: 167, 8: 198,
    9: 224, 10: 259, 11: 290, 12: 320, 13: 358, 14: 394, 15: 431,
    16: 470, 17: 495, 18: 528, 19: 570, 20: 610, 21: 650, 22: 685,
    23: 728, 24: 767, 25: 808, 26: 891, 27: 931, 28: 969, 29: 997,
    30: 1037, 31: 1072, 32: 1113, 33: 1152
};

// -------------------------
// One Piece season -> absolute episode
// -------------------------
function getOnePieceAbsoluteEpisode(season, episode) {
    const startEpisodes = {
        1: 1, 2: 9, 3: 31, 4: 48, 5: 61, 6: 70, 7: 92, 8: 131, 9: 144, 
        10: 196, 11: 227, 12: 326, 13: 382, 14: 482, 15: 517, 16: 579,
        17: 628, 18: 746, 19: 779, 20: 877, 21: 891, 22: 1085
    };
    if (!startEpisodes[season]) return null;
    return startEpisodes[season] + (episode - 1);
}

// -------------------------
// Naruto season -> absolute episode
// -------------------------
function getNarutoAbsoluteEpisode(season, episode) {
    const startEpisodes = {
        1: 1,
        2: 36,
        3: 84,
        4: 132,
        5: 180
    };
    if (!startEpisodes[season]) return null;
    return startEpisodes[season] + (episode - 1);
}

// -------------------------
// Map season + episode -> absolute episode
// -------------------------
function getAbsoluteEpisode(animeName, season, episodeInSeason) {
    const mappings = {
        'case-closed': caseClosedMapping,
        'detective-conan': caseClosedMapping,
        'one-piece': getOnePieceAbsoluteEpisode,
        'naruto': getNarutoAbsoluteEpisode
    };

    const mapper = mappings[animeName];
    if (!mapper) return episodeInSeason;

    if (animeName === 'case-closed' || animeName === 'detective-conan') {
        const table = mapper;
        if (!table[season]) return episodeInSeason;
        return table[season] + episodeInSeason - 1;
    }

    return mapper(season, episodeInSeason);
}

// -------------------------
// Filler data
// -------------------------
function getFillerData(animeName) {
    const data = {
        'naruto': {
            filler: expandRanges('26,97,101-106,136-140,143-219'),
            mixed: expandRanges('7,9,14-16,18-21,23-24,27-30,37-41,43-47,49,52-60,63,66,69-72,74,83,98-100,112-114,126-127,130-131,141-142,220')
        },

        'naruto-shippuden': {
            filler: expandRanges('28,57,71,89-120,121-125,126-140,141-181,182-196,197-220,223-266,267-272,279-296,303-320,347-361,376-377,388-420,421-500'),
            mixed: expandRanges('284')
        },

        'detective-conan': {
            filler: expandRanges('6,14,17,19,21,24-26,29-30,33,36-37,41,44-45,47,51,53,55-56,59,61-62,64-67,71,73-74,79-80,83,87-90,92-95,97,106-111,119-120,123-127,135,140,143,148-152,155-158,161,165-169,175,179-187,196-198,201-204,207-211,214-216,225,232,235-237,245,248,251-252,255-257,260-262,264-265,273,276,281-283,294-300,303,314-315,318-322,328,337,342,348-349,352-353,357,360,363-365,368-370,373,376-380,384,388-389,392-393,397,403-405,409-410,413-414,418-420,423-424,426,433-434,437,439-442,448,450-452,456,459,461,468,471,475,478,480,483,486,489,512,518-520,527,536,539-541,544,547-548,553-556,562,565-567,570,577,582,588,591,594-596,599,602-607,629-631,634-641,658,663-666,669-670,677-680,686-689,692-698,707-709,716-721,726,729-730,733,735-737,742-743,750,753,757-758,761-762,767-769,774-778,784,789-791,794-807,813,816-821,824-826,829,833-835,838-842,845-846,851-852,855-860,865,868-871,875-877,880,883-884,891-893,898-900,903-908,911-915,918,921-924,929-940,943-951,955-970,975-982,985-992,996-999,1002,1006-1010,1013-1017,1021-1023,1026-1028,1030-1032,1036-1037,1039-1041,1043-1044,1047-1052,1055-1058,1062-1070,1073-1076,1080-1084,1087-1092,1095-1097,1100-1104,1107-1108,1111-1114,1117-1122,1125-1129,1132-1134,1137-1143,1146-1147,1152-1163,1168,1173-1177,1180-1181'),
            mixed: expandRanges('1076')
        },

        'case-closed': {
            filler: expandRanges('6,14,17,19,21,24-26,29-30,33,36-37,41,44-45,47,51,53,55-56,59,61-62,64-67,71,73-74,79-80,83,87-90,92-95,97,106-111,119-120,123-127,135,140,143,148-152,155-158,161,165-169,175,179-187,196-198,201-204,207-211,214-216,225,232,235-237,245,248,251-252,255-257,260-262,264-265,273,276,281-283,294-300,303,314-315,318-322,328,337,342,348-349,352-353,357,360,363-365,368-370,373,376-380,384,388-389,392-393,397,403-405,409-410,413-414,418-420,423-424,426,433-434,437,439-442,448,450-452,456,459,461,468,471,475,478,480,483,486,489,512,518-520,527,536,539-541,544,547-548,553-556,562,565-567,570,577,582,588,591,594-596,599,602-607,629-631,634-641,658,663-666,669-670,677-680,686-689,692-698,707-709,716-721,726-729,733-737,742-743,750,753,757-758,761-762,767-769,774-778,784,789-791,794-807,813,816-821,824-826,829,833-835,838-842,845-846,851-852,855-860,865,868-871,875-877,880,883-884,891-893,898-900,903-908,911-915,918,921-924,929-940,943-951,955-970,975-982,985-992,996-999,1002,1006-1010,1013-1017,1021-1023,1026-1028,1030-1032,1036-1037,1039-1041,1043-1044,1047-1052,1055-1058,1062-1070,1073-1076,1080-1084,1087-1092,1095-1097,1100-1104,1107-1108,1111-1114,1117-1122,1125-1129,1132-1134,1137-1143,1146-1147,1152-1163,1168,1173-1177,1180-1181'),
            mixed: expandRanges('1076')
        },

        'one-piece': {
            filler: expandRanges('54-60,98-99,102,131-143,196-206,220-225,279-283,291-292,303,317-319,326-336,382-384,406-407,426-429,457-458,492,542,575-578,590,626-627,747-750,780-782,895-896,907,1029-1030'),
            mixed: expandRanges('45-47,61,68-69,101,226,354,421,489,520,574,625,628,633,653,657,679,690,731,738,751,777-778,789,803,807,878-879,881-885,887-890,924,988-989,991')
        },

        'bleach': {
            filler: expandRanges('33,50,64-108,128-137,147-149,168-189,204-205,213-214,228-266,287,298-299,303-305,311-341,355'),
            mixed: expandRanges('8,27,32,46,109,111,116,119-120,124,141,143,146,156,160-161,190,193,206-207,209,222-223,267-268,274,276,284-285,288,290-291,295-296,310,342-343,345,347,351,357')
        },

        'my-hero-academia': {
            filler: expandRanges('38-39,58-60,64-74'),
            mixed: []
        },

        'attack-on-titan': {
            filler: [],
            mixed: []
        }
    };

    return data[animeName] || { filler: [], mixed: [] };
}

// -------------------------
// Stream handler
// -------------------------
builder.defineStreamHandler(async ({ type, id }) => {
    console.log(`Stream request: ${type} - ${id}`);

    if (type !== 'series') return { streams: [] };

    const parts = id.split(':');
    if (parts.length < 3) return { streams: [] };

    const seriesId = parts[0];
    const season = parseInt(parts[1]);
    const episodeInSeason = parseInt(parts[2]);

    const animeName = animeMappings[seriesId];
    if (!animeName) return { streams: [] };

    const absoluteEpisode = getAbsoluteEpisode(animeName, season, episodeInSeason);
    const fillerData = getFillerData(animeName);

    let streamName = 'Anime Filler Info';
    let streamTitle = '';

    if (fillerData.filler.includes(absoluteEpisode)) {
        streamTitle = '🚫 FILLER - Not Canon (Safe to skip)';
    } else if (fillerData.mixed.includes(absoluteEpisode)) {
        streamTitle = '⚡ MIXED CONTENT - Partial canon';
    } else {
        streamTitle = '✅ CANON EPISODE - Main storyline';
    }

    return { 
        streams: [{
            name: streamName,
            title: streamTitle,
            externalUrl: 'https://www.animefillerlist.com'
        }]
    };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });
console.log(`Anime Filler Info addon running on port ${port}`);
