const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const manifest = {
    id: 'community.anime.filler.detector',
    version: '4.0.0',
    name: 'Anime Filler Guide',
    description: 'Browse anime with filler episodes clearly marked',
    resources: ['catalog', 'meta'],
    types: ['series'],
    catalogs: [
        {
            type: 'series',
            id: 'anime-filler-guide',
            name: 'Anime Filler Guide',
            extra: [
                {
                    name: 'search',
                    isRequired: false
                }
            ]
        }
    ],
    idPrefixes: ['filler']
};

const builder = new addonBuilder(manifest);

const animeList = [
    {
        id: 'filler:naruto',
        imdbId: 'tt0409591',
        type: 'series',
        name: 'Naruto',
        poster: 'https://image.tmdb.org/t/p/w500/vauCEnR7CiyBDzRCeElKkCaXIYu.jpg',
        description: 'Naruto Uzumaki, a young ninja who seeks recognition and dreams of becoming the Hokage.',
        genres: ['Animation', 'Action', 'Adventure'],
        releaseInfo: '2002-2007',
        fillerCount: 89,
        totalEpisodes: 220,
        fillerPercentage: 40
    },
    {
        id: 'filler:naruto-shippuden',
        imdbId: 'tt0988824',
        type: 'series',
        name: 'Naruto Shippuden',
        poster: 'https://image.tmdb.org/t/p/w500/zAYRe2bJxpWTVrwwmBc00VFkAf4.jpg',
        description: 'Naruto Uzumaki returns after training to reunite with his friends and face new threats.',
        genres: ['Animation', 'Action', 'Adventure'],
        releaseInfo: '2007-2017',
        fillerCount: 205,
        totalEpisodes: 500,
        fillerPercentage: 41
    },
    {
        id: 'filler:detective-conan',
        imdbId: 'tt0805564',
        type: 'series',
        name: 'Detective Conan (Case Closed)',
        poster: 'https://image.tmdb.org/t/p/w500/4AXETrYnFEFH2pWLLrXOkrNGVxl.jpg',
        description: 'The cases of a detective whose physical age was chemically reversed to that of a prepubescent boy.',
        genres: ['Animation', 'Mystery', 'Crime'],
        releaseInfo: '1996-Present',
        fillerCount: 380,
        totalEpisodes: 850,
        fillerPercentage: 45
    },
    {
        id: 'filler:one-piece',
        imdbId: 'tt2560140',
        type: 'series',
        name: 'One Piece',
        poster: 'https://image.tmdb.org/t/p/w500/cMD9Ygz11zjJzAovURpO75Qg7rT.jpg',
        description: 'Follows the adventures of Monkey D. Luffy and his pirate crew in order to find the greatest treasure ever left by the legendary Pirate, Gold Roger.',
        genres: ['Animation', 'Action', 'Adventure'],
        releaseInfo: '1999-Present',
        fillerCount: 100,
        totalEpisodes: 1000,
        fillerPercentage: 10
    },
    {
        id: 'filler:bleach',
        imdbId: 'tt1355642',
        type: 'series',
        name: 'Bleach',
        poster: 'https://image.tmdb.org/t/p/w500/2EewmxXe72ogD0EaWM8gqa0ccIw.jpg',
        description: 'High school student Ichigo Kurosaki, who has the ability to see ghosts, gains soul reaper powers.',
        genres: ['Animation', 'Action', 'Adventure'],
        releaseInfo: '2004-2012',
        fillerCount: 160,
        totalEpisodes: 366,
        fillerPercentage: 44
    },
    {
        id: 'filler:my-hero-academia',
        imdbId: 'tt5626028',
        type: 'series',
        name: 'My Hero Academia',
        poster: 'https://image.tmdb.org/t/p/w500/ppT0nx2wUdzyzFv3NwiS9yI4NVJ.jpg',
        description: 'A superhero-loving boy enrolls in a prestigious hero academy and learns what it takes to become a hero.',
        genres: ['Animation', 'Action', 'Adventure'],
        releaseInfo: '2016-Present',
        fillerCount: 15,
        totalEpisodes: 113,
        fillerPercentage: 13
    },
    {
        id: 'filler:attack-on-titan',
        imdbId: 'tt2098220',
        type: 'series',
        name: 'Attack on Titan',
        poster: 'https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
        description: 'After his hometown is destroyed and his mother is killed, Eren Jaeger vows to eliminate the giant humanoid Titans.',
        genres: ['Animation', 'Action', 'Drama'],
        releaseInfo: '2013-2023',
        fillerCount: 0,
        totalEpisodes: 87,
        fillerPercentage: 0
    }
];

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

function getFillerData(animeId) {
    const data = {
        'naruto': {
            filler: [26, 97, 101, 102, 103, 104, 105, 106, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220],
            mixed: [27, 185, 189]
        },
        'naruto-shippuden': {
            filler: [28, 57, 71, 89, 90, 91, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255, 256, 257, 258, 259, 260, 261, 262, 263, 264, 265, 266, 267, 268, 269, 270, 271, 279, 280, 281, 284, 285, 290, 291, 292, 293, 294, 295, 296, 303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 347, 348, 349, 350, 351, 352, 353, 354, 355, 356, 357, 358, 359, 360, 361, 376, 377, 388, 389, 390, 391, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 428, 429, 430, 431, 432, 433, 434, 435, 436, 437, 438, 439, 440, 441, 442, 443, 444, 445, 446, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500],
            mixed: [284]
        },
        'detective-conan': {
            filler: expandRanges('6,14,17,19,21,24-26,29-30,33,36-37,41,44-45,47,51,53,55-56,59,61-62,64-67,71,73-74,79-80,83,87-90,92-95,97,106-111,119-120,123-127,135,140,143,148-152,155,158-161,165,169,175,179-187,196-198,201-204,207-211,214-216,225,232,235-237,245,248,251-252,255-257,260-262,264-265,273,276,281-283,294-300,303,314-315,318-322,328,337,342,348-349,352-353,357,360,363-365,368-370,373,376-380,384,388-389,392-393,397,403-405,409-410,413-414,418-420,423-424,426,433-434,437,439-442,448,450-452,456,459,461,468,471,475,478,480,483,486,489,512,518-520,527,536,539-541,544,547-548,553-556,562,565-567,570,577,582,588,591,594-596,599,602-607,629-631,634-641,658,663-666,669-670,677-680,686-689,692-698,707-709,716-721,726,729-730,733,735-737,742-743,750,753,757-758,761-762,767-769,774-778,784,789-791,794-807,813,816-821,824-826,829,833-835,838-842,845-846'),
            mixed: []
        }
    };
    return data[animeId] || { filler: [], mixed: [] };
}

builder.defineCatalogHandler(async ({ type, id, extra }) => {
    console.log('Catalog request:', { type, id, extra });
    
    if (id === 'anime-filler-guide') {
        let results = [...animeList];
        
        if (extra && extra.search) {
            const searchTerm = extra.search.toLowerCase();
            results = results.filter(anime => 
                anime.name.toLowerCase().includes(searchTerm)
            );
        }
        
        const metas = results.map(anime => ({
            id: anime.id,
            type: 'series',
            name: anime.name,
            poster: anime.poster,
            posterShape: 'poster',
            description: `${anime.description}\n\n📊 Filler Statistics:\n• Total Episodes: ${anime.totalEpisodes}\n• Filler Episodes: ${anime.fillerCount}\n• Filler Percentage: ${anime.fillerPercentage}%`,
            genres: anime.genres,
            releaseInfo: anime.releaseInfo
        }));
        
        return { metas };
    }
    
    return { metas: [] };
});

builder.defineMetaHandler(async ({ type, id }) => {
    console.log('Meta request:', { type, id });
    
    if (!id.startsWith('filler:')) {
        return { meta: {} };
    }
    
    const animeId = id.replace('filler:', '');
    const anime = animeList.find(a => a.id === id);
    
    if (!anime) {
        return { meta: {} };
    }
    
    const fillerData = getFillerData(animeId);
    const videos = [];
    
    for (let i = 1; i <= anime.totalEpisodes; i++) {
        let title = `Episode ${i}`;
        let overview = '';
        
        if (fillerData.filler.includes(i)) {
            title = `🚫 Episode ${i} - FILLER`;
            overview = 'This is a filler episode. Not part of the main story and can be skipped.';
        } else if (fillerData.mixed.includes(i)) {
            title = `⚡ Episode ${i} - MIXED`;
            overview = 'This episode contains both filler and canon content.';
        } else {
            title = `✅ Episode ${i} - CANON`;
            overview = 'This episode is part of the main storyline.';
        }
        
        videos.push({
            id: `${id}:1:${i}`,
            title: title,
            episode: i,
            season: 1,
            overview: overview,
            released: new Date(2020, 0, i).toISOString()
        });
    }
    
    return {
        meta: {
            id: id,
            type: 'series',
            name: anime.name,
            poster: anime.poster,
            background: anime.poster,
            description: `${anime.description}\n\n📊 Filler Statistics:\n• Total Episodes: ${anime.totalEpisodes}\n• Filler Episodes: ${anime.fillerCount}\n• Filler Percentage: ${anime.fillerPercentage}%\n\n✅ Canon Episode\n🚫 Filler Episode\n⚡ Mixed Content`,
            genres: anime.genres,
            releaseInfo: anime.releaseInfo,
            videos: videos
        }
    };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });
console.log(`Anime Filler Guide running on port ${port}`);
