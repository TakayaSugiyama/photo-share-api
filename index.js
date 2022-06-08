const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    githubLogin: ID!
    name: String
    avatar: String
    postedPhotos: [Photo!]!
  }

  enum PhotoCategory {
    SELFIE
    PORTRAIT
    ACTION
    LANDSCAPE
    GRAPHIC
  }

  type Photo {
    id: ID!
    url: String!
    name: String!
    description: String
    category: PhotoCategory!
    photoBy: User!
  }

  type Query {
    totalPhotos: Int!
    allPhotos: [Photo!]!
  }

  input PostPhotoInput {
    name: String!
    description: String
    category: PhotoCategory = PORTRAIT
  }

  type Mutation {
    postPhoto(input: PostPhotoInput!): Photo!
  }
`;

let _id = 0;
const users = [
  {
    githubLogin: "mHattrup",
    name: "Mike Hattrup",
  },
  {
    githubLogin: "gPlake",
    name: "Glen Plake",
  },
  {
    githubLogin: "sSchmidt",
    name: "Scot Schmidt",
  },
];

var photos = [
  {
    id: "1",
    name: "Dropping the Heart Chute",
    description: "The heart chute is one of my favorite chutes",
    category: "ACTION",
    githubUser: "gPlake",
  },
  {
    id: "2",
    name: "Enjoying the sunshine",
    category: "SELFIE",
    githubUser: "sSchmidt",
  },
  {
    id: "3",
    name: "Gunbarrel 25",
    description: "25 laps on gunbarrel today",
    category: "LANDSCAPE",
    githubUser: "sSchmidt",
  },
];

const resolvers = {
  Query: {
    totalPhotos: () => photos.length,
    allPhotos: () => photos,
  },
  Mutation: {
    postPhoto: (parent, args) => {
      let newPhoto = {
        id: _id++,
        ...args.input,
      };
      photos.push(newPhoto);
      return newPhoto;
    },
  },
  Photo: {
    url: (parent) => `https://yoursite.com/img/${parent.id}.jpg`,
    photoBy: (parent) => users.find((u) => u.githubLogin == parent.githubUser),
  },
  User: {
    postedPhotos: (parent) =>
      photos.filter((p) => p.githubUser == parent.githubLogin),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  csrfPrevention: true,
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
