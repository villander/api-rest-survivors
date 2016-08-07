const mockSurvivors = [
  {
    name: 'Survivor Brown',
    age: '34',
    gender: 'male',
    lastLocation: [
      17,
      77
    ],
    isInfected: false,
    indications: [],
    inventory: [
      {
        name: 'Food',
        points: 3
      }
    ]
  },
  {
    name: 'Survivor Rock',
    age: '34',
    gender: 'male',
    lastLocation: [
      67,
      -7
    ],
    isInfected: false,
    indications: [],
    inventory: [
      {
        name: 'Medication',
        points: 2
      },
      {
        name: 'Ammunition',
        points: 1
      }
    ]
  }
];

const firstSurvivor = {
  name: 'Dilmãe',
  age: '67',
  gender: 'female',
  lastLocation: [
    9,
    -45
  ],
  isInfected: false,
  inventory: [{
    name: 'Water',
    points: 4
  }]
};

const secondSurvivor = {
  name: 'James Brown',
  age: '54',
  gender: 'male',
  lastLocation: [
    17,
    6
  ],
  isInfected: false,
  indications: [],
  inventory: [{
    name: 'Food',
    points: 3
  }]
};

const thirdSurvivor = {
  name: 'Selma',
  age: '67',
  gender: 'female',
  lastLocation: [
    9,
    -45
  ],
  isInfected: true,
  inventory: [{
    name: 'Water',
    points: 4
  }]
};

const fourthSurvivor = {
  name: 'Dyego',
  age: '67',
  gender: 'male',
  lastLocation: [
    13,
    -44
  ],
  isInfected: true,
  inventory: [
    {
      name: 'Water',
      points: 4
    },
    {
      name: 'Water',
      points: 4
    }
  ]
};


export {
mockSurvivors,
firstSurvivor,
secondSurvivor,
thirdSurvivor,
fourthSurvivor
};
