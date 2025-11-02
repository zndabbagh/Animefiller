const { addonBuilder, serveHTTP } = require('stremio-addon-sdk');

const manifest = {
  id: 'community.anime.filler.detector',
  version: '4.0.0',
  name: 'Filler Info',
  description: 'Shows whether Naruto and Case Closed episodes are filler, mixed, or canon',
  resources: ['stream'],
  types: ['series'],
  catalogs: [],
  idPrefixes: ['tt', 'kitsu']
};

const builder = new addonBuilder(manifest);

const animeMappings = {
  'tt0409591': 'naruto',
  'tt0988824': 'naruto-shippuden',
  'tt0805564': 'detective-conan',
  'tt0388629': 'case-closed'
};

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

function getFillerData(animeName) {
  const data = {
    naruto: {
      filler: expandRanges('26,97,101-106,136-140,143-219'),
      mixed: expandRanges('27,102,142')
    },
    'naruto-shippuden': {
      filler: expandRanges('57,91-112,144-151,170-171,176-196,223-242,257-260,271,279-281,284-289,303-320,347-361,376-377,388-390,394-413,416,422-423,427-450,464-468,480-483'),
      mixed: expandRanges('54,290-295,303')
    },
    'detective-conan': {
      filler: expandRanges('6,14,17,19,21,24-26,29-30,32,34-35,37-38,40,43,45,47-48,50,52,54-55,57-58,60-61,63-64,66,68,70-71,73,75,77-78,80-81,83-84,86,88-89,91,93,95,97-98,100-101,103-104,106-107,109-110,112-113,115,117-118,120-121,123,125-126,128-129,131,133-134,136-137,139,141,143,145,147-148,150,152,154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,218,220,222,224,226,228,230,232,234,236,238,240,242,244,246,248,250,252,254,256,258,260,262,264,266,268,270,272,274,276,278,280,282,284,286,288,290,292,294,296,298,300,302,304,306,308,310,312,314,316,318,320,322,324,326,328,330,332,334,336,338,340,342,344,346,348,350,352,354,356,358,360,362,364,366,368,370,372,374,376,378,380,382,384,386,388,390,392,394,396,398,400,402,404,406,408,410,412,414,416,418,420,422,424,426,428,430,432,434,436,438,440,442,444,446,448,450,452,454,456,458,460,462,464,466,468,470,472,474,476,478,480,482,484,486,488,490,492,494,496,498,500-1100'), // filler for first 1100 eps
      mixed: []
    },
    'case-closed': {
      filler: expandRanges('6,14,17,19,21,24-26,29-30,32,34-35,37-38,40,43,45,47-48,50,52,54-55,57-58,60-61,63-64,66,68,70-71,73,75,77-78,80-81,83-84,86,88-89,91,93,95,97-98,100-101,103-104,106-107,109-110,112-113,115,117-118,120-121,123,125-126,128-129,131,133-134,136-137,139,141,143,145,147-148,150,152,154,156,158,160,162,164,166,168,170,172,174,176,178,180,182,184,186,188,190,192,194,196,198,200,202,204,206,208,210,212,214,216,218,220,222,224,226,228,230,232,234,236,238,240,242,244,246,248,250,252,254,256,258,260,262,264,266,268,270,272,274,276,278,280,282,284,286,288,290,292,294,296,298,300,302,304,306,308,310,312,314,316,318,320,322,324,326,328,330,332,334,336,338,340,342,344,346,348,350,352,354,356,358,360,362,364,366,368,370,372,374,376,378,380,382,384,386,388,390,392,394,396,398,400,402,404,406,408,410,412,414,416,418,420,422,424,426,428,430,432,434,436,438,440,442,444,446,448,450,452,454,456,458,460,462,464,466,468,470,472,474,476,478,480,482,484,486,488,490,492,494,496,498,500-1100'),
      mixed: []
    }
  };
  return data[animeName] || { filler: [], mixed: [] };
}

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
      name: 'Filler Info',
      title,
      description,
      url: `magnet:?xt=urn:btih:fillerinfo-${seriesId}-${episode}`,
      behaviorHints: { configurable: false, editable: false }
    }]
  };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port });
console.log(`✅ Filler Info Addon running on port ${port}`);
