export const validatorParams = {
  name: {
    maxLength: 255,
  },
  file: {
    link: {
      pattern: 'https?://.*',
      maxLength: 2000,
    },
    displayName: {
      maxLength: 255,
    },
    subtitle: {
      label: {
        maxLength: 25,
      },
    },
  },
  author: {
    author: {
      maxLength: 50,
    },
  },
  description: {
    maxLength: 2000,
  },
  educationalFramework: {
    maxLength: 255,
  },
  ageRange: {
    min: {
      min: 0,
      pattern: '[0-9]*',
      maxLength: 3,
    },
    max: {
      min: 0,
      pattern: '[0-9]*',
      maxLength: 3,
    },
  },
  timeRequired: {
    maxLength: 50,
  },
  reference: {
    url: {
      pattern: 'https?://.*',
      maxLength: 2000,
    },
    name: {
      maxLength: 255,
    },
  },
  common: {
    pattern: {
      numeric: '[0-9]*',
    }
  },
};
