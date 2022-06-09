const { ApolloServer, gql } = require("apollo-server-express");
const express = require("express");
const { GraphQLScalarType, Kind } = require("graphql");
const expressPlayGround =
  require("graphql-playground-middleware-express").default;
const { readFileSync } = require("fs");

const app = express();

const typeDefs = readFileSync("./type.graphql", "UTF-8");
const resolvers = require("./resolvers");

const startServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    csrfPrevention: true,
  });

  await server.start();
  server.applyMiddleware({ app });
  app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
  app.get("/playground", expressPlayGround({ endpoint: "/graphql" }));
  app.listen({ port: 4000 }, () => console.log("server start!!"));
};

startServer();
