const { addonBuilder, serveHTTP } = require(‘stremio-addon-sdk’);

// Manifest for the addon
const manifest = {
id: ‘community.anime.filler.detector’,
version: ‘1.0.0’,
name: ‘Anime Filler Detector’,
description: ‘Marks filler episodes for anime series using community data’,
resources: [‘meta’, ‘catalog’],
types: [‘series’],
catalogs: [],
idPrefixes: [‘tt’, ‘kitsu’]
};

const builder = new addonBuilder(manifest);

// Filler data source - using anime filler list API
const FILLER_API = ‘https://www.animefillerlist.com/shows’;

// Cache for filler data
const fillerCache = new Map();

// Helper function to extract anime name from IMDB/Kitsu ID
async function getAnimeName(id) {
// This would need to map IMDB/Kitsu IDs to anime names
// For now, we’ll use a simple mapping approach
const knownMappings = {
‘tt0409591’: ‘naruto’,
‘tt0988824’: ‘naruto-shippuden’,
‘tt2560140’: ‘one-piece’,
‘tt1355642’: ‘bleach’,
‘tt5626028’: ‘my-hero-academia’,
‘tt2098220’: ‘attack-on-titan’
};

```
return knownMappings[id] || null;
```

}

// Fetch filler data from anime filler list
async function getFillerData(animeName) {
if (fillerCache.has(animeName)) {
return fillerCache.get(animeName);
}

```
try {
    // In a real implementation, you'd scrape or use an API
    // This is a placeholder structure
    const fillerData = await fetchFillerList(animeName);
    fillerCache.set(animeName, fillerData);
    return fillerData;
} catch (error) {
    console.error('Error fetching filler data:', error);
    return null;
}
```

}

// Mock function - replace with actual API call
async function fetchFillerList(animeName) {
// Example structure of filler data
return {
‘naruto’: {
filler: [26, 97, 101, 102, 103, 104, 105, 106, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220],
mixed: [27, 185, 189]
}
}[animeName] || { filler: [], mixed: [] };
}

// Meta handler to add filler information
builder.defineMetaHandler(async ({ type, id }) => {
if (type !== ‘series’) {
return { meta: {} };
}

```
const animeName = await getAnimeName(id);
if (!animeName) {
    return { meta: {} };
}

const fillerData = await getFillerData(animeName);
if (!fillerData) {
    return { meta: {} };
}

// Get the original metadata (this would require fetching from another source)
// For now, we'll return modified metadata with filler information
const meta = {
    id: id,
    type: 'series',
    name: animeName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    videos: []
};

// Add episode information with filler markers
// This assumes we have episode data to enhance
const totalEpisodes = Math.max(
    ...fillerData.filler,
    ...fillerData.mixed,
    0
);

for (let i = 1; i <= totalEpisodes || i <= 50; i++) {
    let title = `Episode ${i}`;
    let description = '';
    
    if (fillerData.filler.includes(i)) {
        title = `🚫 FILLER - Episode ${i}`;
        description = '⚠️ This is a filler episode (not part of the main story)';
    } else if (fillerData.mixed.includes(i)) {
        title = `⚡ MIXED - Episode ${i}`;
        description = '📝 This episode contains both filler and canon content';
    } else {
        title = `✅ CANON - Episode ${i}`;
        description = '📖 This episode is part of the main storyline';
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
```

});

// Serve the addon
const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });

console.log(`Anime Filler Detector addon running on http://127.0.0.1:${port}`);
console.log(`Install URL: http://127.0.0.1:${port}/manifest.json`);
