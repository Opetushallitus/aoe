export const sortOptions = {
  relevance: {
    value: 'relevance',
    sort: null,
  },
  newest: {
    value: 'newest',
    sort: {
      updatedAt: 'desc',
    },
  },
  oldest: {
    value: 'oldest',
    sort: {
      updatedAt: 'asc',
    },
  },
  popularity: {
    value: 'popularity',
    sort: {
      popularity: 'desc',
    },
  },
};
