module.exports = {
  totalPhotos: (parent, args, { db }) =>
    db.collection(`posts`).estimatedDocumentCount(),
  allPhotos: (parent, args, { db }) => db.collection(`posts`).find().toArray(),
  totalUsers: (parent, args, { db }) =>
    db.collection(`users`).estimatedDocumentCount(),
  allUsers: (parent, args, { db }) => db.collection(`users`).find().toArray(),
  me: (parent, args, { currentUser }) => currentUser,
};
