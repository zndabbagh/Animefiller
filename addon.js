const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const manifest = {
  id: 'community.anime.filler.detector',
  version: '3.1.0',
  name: 'Filler Info',
  description: 'Shows whether anime episodes are filler, mixed, or canon',
  resources: ['stream'],
  types: ['series'],
  catalogs: [],
  idPrefixes: ['tt', 'kitsu']
};

const builder = new addonBuilder(manifest);

// Map anime IMDb IDs to short names
const animeMappings = {
  'tt0409591': 'naruto',
  'tt0988824': 'naruto-shippuden',
  'tt0805564': 'detective-conan',
  'tt0388629': 'case-closed'
};

// Expand range strings like "5-8,10" into [5,6,7,8,10]
function expandRanges(rangeStr) {
  const episodes = [];
  const parts = rangeStr.split(',').map(s => s.trim());
  for (const part of parts) {
    if (part.includes('-')) {
      const [start, end] = part.split('-').map(Number);
      for (let i = start; i <= end; i++) episodes.push(i);
    } else {
      episodes.push(Number(part));
    }
  }
  return episodes;
}

// Minimal sample filler data (you can expand this later)
function getFillerData(animeName) {
  const data = {
    naruto: {
      filler: [26, 97, 101],
      mixed: [27]
    },
    'naruto-shippuden': {
      filler: [28, 57, 89],
      mixed: []
    },
    'detective-conan': {
      filler: expandRanges('6,14,17,19,21,24-26,29-30'),
      mixed: []
    },
    'case-closed': {
      filler: expandRanges('6,14,17,19,21,24-26,29-30'),
      mixed: []
    }
  };
  return data[animeName] || { filler: [], mixed: [] };
}

// Define how the addon responds when Stremio requests a stream
builder.defineStreamHandler(async ({ type, id }) => {
  console.log('Stream request:', { type, id });

  if (type !== 'series') return { streams: [] };

  const parts = id.split(':');
  const seriesId = parts[0];
  const episode = parseInt(parts[2]);
  const animeName = animeMappings[seriesId];

  if (!animeName) {
    console.log('Anime not found:', seriesId);
    return { streams: [] };
  }

  const fillerData = getFillerData(animeName);

  let title = '';
  let description = '';

  if (fillerData.filler.includes(episode)) {
    title = '🚫 FILLER EPISODE';
    description = 'This episode is not part of the main story. Safe to skip.';
  } else if (fillerData.mixed.includes(episode)) {
    title = '⚡ MIXED CONTENT';
    description = 'Contains both filler and canon material.';
  } else {
    title = '✅ CANON EPISODE';
    description = 'Main storyline episode. Recommended to watch.';
  }

  return {
    streams: [{
      name: 'Filler Info',          // This label becomes the tab name
      title,
      description,
      url: 'https://example.com',   // dummy URL so it appears as a playable source
      behaviorHints: {
        configurable: false,
        editable: false
      }
    }]
  };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });
console.log(`Filler Info Addon running on port ${port}`);
