module.export = {
  newPhoto: {
    subscribe: (parent, args, { pubsub }) =>
      pubsub.asyncIterator("photo-added"),
  },
};
