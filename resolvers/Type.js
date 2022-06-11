const { GraphQLScalarType, Kind } = require("graphql");

module.exports = {
  Photo: {
    id: (parent) => parent.id || parent._id,
    url: (parent) => `/img/photos/${parent.id}.jpg`,
    photoBy: (parent, args, { db }) =>
      db.collection("users").findOne({ githubLogin: parent.userID }),
    taggedUsers: (parent) =>
      tags
        .filter((tag) => tag.photoID === parent.id)
        .map((tag) => tag.userID)
        .map((userID) => users.find((u) => u.githubLogin === userID)),
  },
  User: {
    postedPhotos: (parent) =>
      photos.filter((p) => p.githubUser == parent.githubLogin),
    inPhotos: (parent) =>
      tags
        .filter((tag) => tag.userID === parent.ID)
        .map((tag) => tag.photoID)
        .map((photoID) => photos.find((p) => p.ID === photoID)),
  },
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "A valid date time value",
    parseValue: (value) => new Date(value),
    serialize: (value) => new Date(value).toISOString(),
    parseLiteral: (ast) => ast.value,
  }),
};