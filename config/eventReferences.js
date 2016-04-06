module.exports = {
  eventStatuses: {
    0: 'New event',
    1: 'First wave started',
    2: 'First wave done',
    3: 'Second wave started',
    4: 'Second wave done',
    5: 'IVR started',
    6: 'IVR done',
    7: 'Call center started',
    8: 'Call center done',
    99: 'Not paid',
    100: 'Passed'
  },
  eventWavesTypes: {
    firstWave: {
      0: 'First wave started',
      1: 'First wave done'
    },
    secondWave: {
      0: 'Second wave started',
      1: 'Second wave done'
    },
    IVR: {
      0: 'IVR started',
      1: 'IVR done'
    },
    callCenter: {
      0: 'Call center started',
      1: 'Call center done'
    }
  },
  waveStatus: {
    start: 0,
    end: 1
  }
};
