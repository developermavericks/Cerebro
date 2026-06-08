// ✰ webmeji config ✰
window.SPAWNING = [
  { id: 'webmeji-1', config: 'MIKU_CONFIG' },
  { id: 'webmeji-2', config: 'C1_CONFIG' },
  { id: 'webmeji-3', config: 'C2_CONFIG' },
  { id: 'webmeji-4', config: 'C3_CONFIG' }
];

window.SHIMEJI_CONFIG = {
  ALLOWANCES: ['pet', 'drag', 'bottom', 'top', 'left', 'right'],
  walkspeed: 50,
  fallspeed: 200,
  jumpspeed: 150,
  gettingupspeed: 2000,

  walk: {
    frames: ["shimeji/shime1.png", "shimeji/shime2.png", "shimeji/shime3.png", "shimeji/shime2.png"],
    interval: 175, loops: 6},

  stand: {
    frames: ["shimeji/shime1.png"],
    interval: 200, loops: 1},

  sit: {
    frames: ["shimeji/shime11.png"],
    interval: 1000, loops: 1,
    randomizeDuration: true, min: 3000, max: 11000},

  spin: {
    frames: ["shimeji/shime1.png"],
    interval: 150, loops: 3},

  dance: {
    frames: ["shimeji/shime5.png", "shimeji/shime6.png", "shimeji/shime1.png"],
    interval: 200, loops: 5},

  trip: {
    frames: ["shimeji/shime20.png", "shimeji/shime21.png", "shimeji/shime21.png", "shimeji/shime20.png", "shimeji/shime21.png", "shimeji/shime21.png"],
    interval: 250, loops: 1},

  forcewalk: { loops: 6},

  forcethink: {
    frames: ["shimeji/shime27.png", "shimeji/shime28.png"],
    interval: 500, loops: 2},

  pet: {
    frames: ["shimeji/shime15.png", "shimeji/shime16.png", "shimeji/shime17.png"],
    interval: 75},

  drag: {
    frames: ["shimeji/shime5.png", "shimeji/shime7.png", "shimeji/shime5.png", "shimeji/shime6.png", "shimeji/shime8.png", "shimeji/shime6.png"],
    interval: 210},

  falling: {
    frames: ["shimeji/shime4.png"],
    interval: 200, loops: 2},

  fallen: {
    frames: ["shimeji/shime19.png", "shimeji/shime18.png"],
    interval: 250, loops: 1},

  ORIGINAL_ACTIONS: [
    'walk','walk','walk','walk','walk','walk',
    'walk','walk','walk','walk','walk','walk',
    'spin','spin','spin',
    'sit','sit',
    'dance','dance',
    'trip'
  ],

  EDGE_ACTIONS: [
    'hang','hang',
    'climb','climb','climb','climb',
    'fall','fall'
  ],

  JUMP_CHANCE: 0.05,

  climbSide: {
    frames: ["shimeji/shime13.png", "shimeji/shime14.png"],
    interval: 200, loops: 2},

  hangstillSide: {
    frames: ["shimeji/shime12.png"],
    interval: 200, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  climbTop: {
    frames: ["shimeji/shime24.png", "shimeji/shime25.png"],
    interval: 200, loops: 6},

  hangstillTop: {
    frames: ["shimeji/shime23.png"],
    interval: 200, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  jump: {
    frames: ["shimeji/shime22.png"],
    interval: 200}
};

window.MIKU_CONFIG = {
  ALLOWANCES: ['pet', 'drag', 'bottom', 'top', 'left', 'right'],
  walkspeed: 50,
  fallspeed: 150,
  jumpspeed: 200,
  gettingupspeed: 3500,

  walk: {
    frames: ["miku/shime1.png", "miku/shime2.png", "miku/shime3.png", "miku/shime2.png"], 
    interval: 175, loops: 6},

  stand: {
    frames: ["miku/shime1.png"], 
    interval: 1000, loops: 1},

  sit: {
    frames: ["miku/shime11.png"], 
    interval: 1000, loops: 1,
    randomizeDuration: true, min: 3000, max: 11000},

  spin: {
    frames: ["miku/shime1.png"], 
    interval: 150, loops: 3},

  dance: {
    frames: ["miku/shime5.png", "miku/shime6.png", "miku/shime1.png"], 
    interval: 200, loops: 2},

  trip: {
    frames: ["miku/shime18.png", "miku/shime19.png", "miku/shime19.png"], 
    interval: 250, loops: 1},

  forcewalk: { loops: 6},

  forcethink: {
    frames: ["miku/shime27.png", "miku/shime28.png"], 
    interval: 500, loops: 2},

  pet: {
    frames: ["miku/shime15.png", "miku/shime16.png", "miku/shime17.png"], 
    interval: 400},

  drag: {
    frames: ["miku/shime7.png", "miku/shime5.png", "miku/shime8.png", "miku/shime6.png"], 
    interval: 210},

  falling: {
    frames: ["miku/shime10.png", "miku/shime18.png"], 
    interval: 200, loops: 2},

  fallen: {
    frames: ["miku/shime9.png", "miku/shime4.png", "miku/shime19.png"], 
    interval: 250, loops: 1},

  ORIGINAL_ACTIONS: [
    'walk','walk','walk','walk','walk','walk',
    'spin','spin','spin',
    'sit','sit',
    'dance','dance','dance','dance','dance',
    'trip'
  ],

  EDGE_ACTIONS: [
    'hang','hang',
    'climb','climb','climb','climb','climb',
    'fall'
  ],

  JUMP_CHANCE: 0.1,

  climbSide: {
    frames: ["miku/shime13.png", "miku/shime14.png"], 
    interval: 200, loops: 2},

  hangstillSide: {
    frames: ["miku/shime12.png"], 
    interval: 200, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  climbTop: {
    frames: ["miku/shime24.png", "miku/shime25.png"], 
    interval: 200, loops: 8},

  hangstillTop: {
    frames: ["miku/shime23.png"], 
    interval: 200, loops: 2,
    randomizeDuration: true, min: 3000, max: 11000},

  jump: {
    frames: ["miku/shime22.png"], 
    interval: 200}
};

window.C1_CONFIG = {
  ALLOWANCES: ['pet', 'drag', 'bottom', 'top', 'left', 'right'],
  walkspeed: 50,
  fallspeed: 200,
  jumpspeed: 150,
  gettingupspeed: 2000,

  walk: { frames: ["cartoons/c1/sprites/0001.webp","cartoons/c1/sprites/0002.webp","cartoons/c1/sprites/0003.webp","cartoons/c1/sprites/0004.webp","cartoons/c1/sprites/0005.webp","cartoons/c1/sprites/0006.webp"], interval: 175, loops: 6 },
  stand: { frames: ["cartoons/c1/sprites/0000.webp"], interval: 200, loops: 1 },
  sit: { frames: ["cartoons/c1/sprites/0060.webp","cartoons/c1/sprites/0061.webp","cartoons/c1/sprites/0062.webp","cartoons/c1/sprites/0063.webp","cartoons/c1/sprites/0064.webp","cartoons/c1/sprites/0065.webp"], interval: 1000, loops: 1, randomizeDuration: true, min: 3000, max: 11000 },
  spin: { frames: ["cartoons/c1/sprites/0126.webp","cartoons/c1/sprites/0127.webp","cartoons/c1/sprites/0128.webp","cartoons/c1/sprites/0129.webp","cartoons/c1/sprites/0130.webp","cartoons/c1/sprites/0131.webp","cartoons/c1/sprites/0132.webp","cartoons/c1/sprites/0133.webp","cartoons/c1/sprites/0134.webp","cartoons/c1/sprites/0133.webp","cartoons/c1/sprites/0132.webp","cartoons/c1/sprites/0131.webp","cartoons/c1/sprites/0130.webp","cartoons/c1/sprites/0129.webp","cartoons/c1/sprites/0128.webp","cartoons/c1/sprites/0127.webp","cartoons/c1/sprites/0126.webp"], interval: 150, loops: 3 },
  dance: { frames: ["cartoons/c1/sprites/0114.webp","cartoons/c1/sprites/0115.webp","cartoons/c1/sprites/0116.webp","cartoons/c1/sprites/0117.webp","cartoons/c1/sprites/0118.webp","cartoons/c1/sprites/0119.webp","cartoons/c1/sprites/0120.webp","cartoons/c1/sprites/0121.webp","cartoons/c1/sprites/0122.webp","cartoons/c1/sprites/0123.webp","cartoons/c1/sprites/0124.webp","cartoons/c1/sprites/0125.webp"], interval: 200, loops: 5 },
  trip: { frames: ["cartoons/c1/sprites/0014.webp"], interval: 250, loops: 1 },
  forcewalk: { loops: 6 },
  forcethink: { frames: ["cartoons/c1/sprites/0095.webp","cartoons/c1/sprites/0096.webp","cartoons/c1/sprites/0097.webp","cartoons/c1/sprites/0098.webp"], interval: 500, loops: 2 },
  pet: { frames: ["cartoons/c1/sprites/0015.webp","cartoons/c1/sprites/0016.webp","cartoons/c1/sprites/0017.webp","cartoons/c1/sprites/0018.webp","cartoons/c1/sprites/0019.webp","cartoons/c1/sprites/0020.webp","cartoons/c1/sprites/0021.webp","cartoons/c1/sprites/0022.webp","cartoons/c1/sprites/0023.webp"], interval: 75 },
  drag: { frames: ["cartoons/c1/sprites/0055.webp","cartoons/c1/sprites/0056.webp","cartoons/c1/sprites/0057.webp","cartoons/c1/sprites/0058.webp"], interval: 210 },
  falling: { frames: ["cartoons/c1/sprites/0014.webp"], interval: 200, loops: 2 },
  fallen: { frames: ["cartoons/c1/sprites/0015.webp","cartoons/c1/sprites/0016.webp","cartoons/c1/sprites/0017.webp","cartoons/c1/sprites/0018.webp","cartoons/c1/sprites/0019.webp","cartoons/c1/sprites/0020.webp","cartoons/c1/sprites/0021.webp","cartoons/c1/sprites/0022.webp","cartoons/c1/sprites/0023.webp"], interval: 250, loops: 1 },

  ORIGINAL_ACTIONS: [
    'walk','walk','walk','walk','walk','walk',
    'walk','walk','walk','walk','walk','walk',
    'spin','spin','spin',
    'sit','sit',
    'dance','dance',
    'trip'
  ],

  EDGE_ACTIONS: [
    'hang','hang',
    'climb','climb','climb','climb',
    'fall','fall'
  ],

  JUMP_CHANCE: 0.06,

  climbSide: { frames: ["cartoons/c1/sprites/0045.webp","cartoons/c1/sprites/0046.webp","cartoons/c1/sprites/0047.webp","cartoons/c1/sprites/0048.webp","cartoons/c1/sprites/0049.webp","cartoons/c1/sprites/0050.webp","cartoons/c1/sprites/0051.webp","cartoons/c1/sprites/0052.webp","cartoons/c1/sprites/0053.webp","cartoons/c1/sprites/0054.webp"], interval: 200, loops: 2 },
  hangstillSide: { frames: ["cartoons/c1/sprites/0054.webp","cartoons/c1/sprites/0053.webp","cartoons/c1/sprites/0052.webp","cartoons/c1/sprites/0051.webp","cartoons/c1/sprites/0050.webp","cartoons/c1/sprites/0049.webp","cartoons/c1/sprites/0048.webp","cartoons/c1/sprites/0047.webp","cartoons/c1/sprites/0046.webp","cartoons/c1/sprites/0045.webp"], interval: 200, loops: 2, randomizeDuration: true, min: 3000, max: 11000 },
  climbTop: { frames: ["cartoons/c1/sprites/0038.webp","cartoons/c1/sprites/0039.webp","cartoons/c1/sprites/0040.webp","cartoons/c1/sprites/0041.webp","cartoons/c1/sprites/0042.webp","cartoons/c1/sprites/0043.webp","cartoons/c1/sprites/0044.webp"], interval: 200, loops: 6 },
  hangstillTop: { frames: ["cartoons/c1/sprites/0038.webp","cartoons/c1/sprites/0039.webp","cartoons/c1/sprites/0040.webp","cartoons/c1/sprites/0041.webp","cartoons/c1/sprites/0042.webp","cartoons/c1/sprites/0043.webp","cartoons/c1/sprites/0044.webp"], interval: 200, loops: 2, randomizeDuration: true, min: 3000, max: 11000 },
  jump: { frames: ["cartoons/c1/sprites/0015.webp","cartoons/c1/sprites/0016.webp","cartoons/c1/sprites/0017.webp","cartoons/c1/sprites/0018.webp","cartoons/c1/sprites/0019.webp","cartoons/c1/sprites/0020.webp","cartoons/c1/sprites/0021.webp","cartoons/c1/sprites/0022.webp","cartoons/c1/sprites/0023.webp"], interval: 200 }
};

window.C2_CONFIG = {
  ALLOWANCES: ['pet', 'drag', 'bottom', 'top', 'left', 'right'],
  walkspeed: 50,
  fallspeed: 200,
  jumpspeed: 150,
  gettingupspeed: 2000,

  walk: { frames: ["cartoons/c2/sprites/0058.webp","cartoons/c2/sprites/0059.webp","cartoons/c2/sprites/0060.webp","cartoons/c2/sprites/0061.webp","cartoons/c2/sprites/0062.webp","cartoons/c2/sprites/0063.webp","cartoons/c2/sprites/0064.webp"], interval: 175, loops: 6 },
  stand: { frames: ["cartoons/c2/sprites/0000.webp"], interval: 200, loops: 1 },
  sit: { frames: ["cartoons/c2/sprites/0006.webp"], interval: 1000, loops: 1, randomizeDuration: true, min: 3000, max: 11000 },
  spin: { frames: ["cartoons/c2/sprites/0010.webp","cartoons/c2/sprites/0011.webp","cartoons/c2/sprites/0012.webp"], interval: 150, loops: 3 },
  dance: { frames: ["cartoons/c2/sprites/0023.webp","cartoons/c2/sprites/0021.webp","cartoons/c2/sprites/0024.webp","cartoons/c2/sprites/0022.webp","cartoons/c2/sprites/0025.webp"], interval: 200, loops: 5 },
  trip: { frames: ["cartoons/c2/sprites/0030.webp","cartoons/c2/sprites/0031.webp","cartoons/c2/sprites/0032.webp","cartoons/c2/sprites/0033.webp","cartoons/c2/sprites/0034.webp"], interval: 250, loops: 1 },
  forcewalk: { loops: 6 },
  forcethink: { frames: ["cartoons/c2/sprites/0019.webp"], interval: 500, loops: 2 },
  pet: { frames: ["cartoons/c2/sprites/0065.webp","cartoons/c2/sprites/0066.webp","cartoons/c2/sprites/0067.webp","cartoons/c2/sprites/0068.webp","cartoons/c2/sprites/0069.webp"], interval: 75 },
  drag: { frames: ["cartoons/c2/sprites/0004.webp","cartoons/c2/sprites/0002.webp","cartoons/c2/sprites/0003.webp","cartoons/c2/sprites/0005.webp","cartoons/c2/sprites/0053.webp","cartoons/c2/sprites/0054.webp"], interval: 210 },
  falling: { frames: ["cartoons/c2/sprites/0001.webp"], interval: 200, loops: 2 },
  fallen: { frames: ["cartoons/c2/sprites/0030.webp","cartoons/c2/sprites/0031.webp","cartoons/c2/sprites/0032.webp","cartoons/c2/sprites/0033.webp","cartoons/c2/sprites/0034.webp"], interval: 250, loops: 1 },

  ORIGINAL_ACTIONS: [
    'walk','walk','walk','walk','walk','walk',
    'walk','walk','walk','walk','walk','walk',
    'spin','spin','spin',
    'sit','sit',
    'dance','dance',
    'trip'
  ],

  EDGE_ACTIONS: [
    'hang','hang',
    'climb','climb','climb','climb',
    'fall','fall'
  ],

  JUMP_CHANCE: 0.06,

  climbSide: { frames: ["cartoons/c2/sprites/0009.webp","cartoons/c2/sprites/0035.webp","cartoons/c2/sprites/0007.webp","cartoons/c2/sprites/0008.webp","cartoons/c2/sprites/0036.webp","cartoons/c2/sprites/0037.webp","cartoons/c2/sprites/0038.webp","cartoons/c2/sprites/0039.webp"], interval: 200, loops: 2 },
  hangstillSide: { frames: ["cartoons/c2/sprites/0040.webp","cartoons/c2/sprites/0041.webp","cartoons/c2/sprites/0042.webp","cartoons/c2/sprites/0043.webp","cartoons/c2/sprites/0044.webp","cartoons/c2/sprites/0045.webp","cartoons/c2/sprites/0046.webp","cartoons/c2/sprites/0047.webp"], interval: 200, loops: 2, randomizeDuration: true, min: 3000, max: 11000 },
  climbTop: { frames: ["cartoons/c2/sprites/0018.webp","cartoons/c2/sprites/0048.webp","cartoons/c2/sprites/0016.webp","cartoons/c2/sprites/0017.webp","cartoons/c2/sprites/0049.webp","cartoons/c2/sprites/0050.webp","cartoons/c2/sprites/0051.webp","cartoons/c2/sprites/0052.webp"], interval: 200, loops: 6 },
  hangstillTop: { frames: ["cartoons/c2/sprites/0018.webp","cartoons/c2/sprites/0048.webp","cartoons/c2/sprites/0016.webp","cartoons/c2/sprites/0017.webp","cartoons/c2/sprites/0049.webp","cartoons/c2/sprites/0050.webp","cartoons/c2/sprites/0051.webp","cartoons/c2/sprites/0052.webp"], interval: 200, loops: 2, randomizeDuration: true, min: 3000, max: 11000 },
  jump: { frames: ["cartoons/c2/sprites/0056.webp"], interval: 200 }
};

window.C3_CONFIG = {
  ALLOWANCES: ['pet', 'drag', 'bottom', 'top', 'left', 'right'],
  walkspeed: 50,
  fallspeed: 200,
  jumpspeed: 150,
  gettingupspeed: 2000,

  walk: { frames: ["cartoons/c3/sprites/0027.webp","cartoons/c3/sprites/0001.webp","cartoons/c3/sprites/0028.webp","cartoons/c3/sprites/0002.webp"], interval: 175, loops: 6 },
  stand: { frames: ["cartoons/c3/sprites/0000.webp"], interval: 200, loops: 1 },
  sit: { frames: ["cartoons/c3/sprites/0008.webp"], interval: 1000, loops: 1, randomizeDuration: true, min: 3000, max: 11000 },
  spin: { frames: ["cartoons/c3/sprites/0012.webp","cartoons/c3/sprites/0013.webp","cartoons/c3/sprites/0014.webp","cartoons/c3/sprites/0013.webp"], interval: 150, loops: 3 },
  dance: { frames: ["cartoons/c3/sprites/0029.webp","cartoons/c3/sprites/0025.webp","cartoons/c3/sprites/0026.webp","cartoons/c3/sprites/0030.webp"], interval: 200, loops: 5 },
  trip: { frames: ["cartoons/c3/sprites/0036.webp","cartoons/c3/sprites/0037.webp","cartoons/c3/sprites/0038.webp","cartoons/c3/sprites/0039.webp"], interval: 250, loops: 1 },
  forcewalk: { loops: 6 },
  forcethink: { frames: ["cartoons/c3/sprites/0023.webp"], interval: 500, loops: 2 },
  pet: { frames: ["cartoons/c3/sprites/0015.webp","cartoons/c3/sprites/0016.webp"], interval: 75 },
  drag: { frames: ["cartoons/c3/sprites/0006.webp","cartoons/c3/sprites/0004.webp","cartoons/c3/sprites/0005.webp","cartoons/c3/sprites/0007.webp","cartoons/c3/sprites/0059.webp","cartoons/c3/sprites/0060.webp"], interval: 210 },
  falling: { frames: ["cartoons/c3/sprites/0003.webp"], interval: 200, loops: 2 },
  fallen: { frames: ["cartoons/c3/sprites/0036.webp","cartoons/c3/sprites/0037.webp","cartoons/c3/sprites/0038.webp","cartoons/c3/sprites/0039.webp"], interval: 250, loops: 1 },

  ORIGINAL_ACTIONS: [
    'walk','walk','walk','walk','walk','walk',
    'walk','walk','walk','walk','walk','walk',
    'spin','spin','spin',
    'sit','sit',
    'dance','dance',
    'trip'
  ],

  EDGE_ACTIONS: [
    'hang','hang',
    'climb','climb','climb','climb',
    'fall','fall'
  ],

  JUMP_CHANCE: 0.06,

  climbSide: { frames: ["cartoons/c3/sprites/0011.webp","cartoons/c3/sprites/0041.webp","cartoons/c3/sprites/0009.webp","cartoons/c3/sprites/0010.webp","cartoons/c3/sprites/0042.webp","cartoons/c3/sprites/0043.webp","cartoons/c3/sprites/0044.webp","cartoons/c3/sprites/0045.webp"], interval: 200, loops: 2 },
  hangstillSide: { frames: ["cartoons/c3/sprites/0046.webp","cartoons/c3/sprites/0047.webp","cartoons/c3/sprites/0048.webp","cartoons/c3/sprites/0049.webp","cartoons/c3/sprites/0050.webp","cartoons/c3/sprites/0051.webp","cartoons/c3/sprites/0052.webp","cartoons/c3/sprites/0053.webp"], interval: 200, loops: 2, randomizeDuration: true, min: 3000, max: 11000 },
  climbTop: { frames: ["cartoons/c3/sprites/0022.webp","cartoons/c3/sprites/0054.webp","cartoons/c3/sprites/0020.webp","cartoons/c3/sprites/0021.webp","cartoons/c3/sprites/0055.webp","cartoons/c3/sprites/0056.webp","cartoons/c3/sprites/0057.webp","cartoons/c3/sprites/0058.webp"], interval: 200, loops: 6 },
  hangstillTop: { frames: ["cartoons/c3/sprites/0022.webp","cartoons/c3/sprites/0054.webp","cartoons/c3/sprites/0020.webp","cartoons/c3/sprites/0021.webp","cartoons/c3/sprites/0055.webp","cartoons/c3/sprites/0056.webp","cartoons/c3/sprites/0057.webp","cartoons/c3/sprites/0058.webp"], interval: 200, loops: 2, randomizeDuration: true, min: 3000, max: 11000 },
  jump: { frames: ["cartoons/c3/sprites/0062.webp"], interval: 200 }
};
