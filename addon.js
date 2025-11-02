const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const manifest = {
  id: 'community.anime.fillerinfo',
  version: '5.0.0',
  name: 'Filler Info',
  description: 'Shows whether anime episodes are filler, mixed, or canon.',
  resources: ['stream'],
  types: ['series'],
  catalogs: [],
  idPrefixes: ['tt', 'kitsu', 'anilist', 'mal', 'yt']
};

const builder = new addonBuilder(manifest);

// Helper: expand episode ranges like "5-8,10"
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

// Filler data
const fillerData = {
  naruto: {
    filler: expandRanges('26,97,101-106,136-220'),
    mixed: [27, 185, 189]
  },
  'naruto-shippuden': {
    filler: expandRanges('57,89-112,144-151,170-171,176-196,223-242,257-260,271,279-281,284-295,303-320,347-361,376-377,388-390,394-413,416-417,422-423,427-451,458-468,480-483'),
    mixed: [284]
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

// Matches known anime titles by text
function matchAnimeFromId(id) {
  const idLower = id.toLowerCase();
  if (idLower.includes('naruto') && !idLower.includes('shippuden')) return 'naruto';
  if (idLower.includes('shippuden')) return 'naruto-shippuden';
  if (idLower.includes('detective') || idLower.includes('conan')) return 'detective-conan';
  if (idLower.includes('case') && idLower.includes('closed')) return 'case-closed';
  return null;
}

builder.defineStreamHandler(async ({ type, id }) => {
  if (type !== 'series') return { streams: [] };

  const parts = id.split(':');
  const episode = parseInt(parts[2]) || 1;
  const anime = matchAnimeFromId(id);

  let title, description;

  if (anime && fillerData[anime]) {
    const f = fillerData[anime];
    if (f.filler.includes(episode)) {
      title = '🚫 FILLER EPISODE';
      description = 'This episode is filler. Safe to skip.';
    } else if (f.mixed.includes(episode)) {
      title = '⚡ MIXED CONTENT';
      description = 'Contains both filler and canon storylines.';
    } else {
      title = '✅ CANON EPISODE';
      description = 'Main storyline episode. Recommended to watch.';
    }
  } else {
    // Default fallback if the anime isn’t matched
    title = 'ℹ️ Unknown Anime';
    description = 'Filler info not available for this title.';
  }

  return {
    streams: [{
      name: 'Filler Info',
      title,
      description,
      url: `magnet:?xt=urn:btih:fillerinfo-${id}-${episode}`,
      behaviorHints: { configurable: false, editable: false }
    }]
  };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });
console.log(`✅ Filler Info Addon running on http://localhost:${port}/manifest.json`);
