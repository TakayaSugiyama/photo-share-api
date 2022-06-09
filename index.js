const { ApolloServer } = require("apollo-server-express");
const express = require("express");
const expressPlayGround =
  require("graphql-playground-middleware-express").default;
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const typeDefs = readFileSync("./type.graphql", "UTF-8");
const resolvers = require("./resolvers");

const startServer = async () => {
  const app = express();
  const MONGO_DB = process.env.DB_HOST;
  const client = new MongoClient(MONGO_DB, { useNewUrlParser: true });
  await client.connect();
  const db = client.db();
  const context = { db };
  console.log("Connected successfully to server");
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context,
    csrfPrevention: true,
  });

  await server.start();
  server.applyMiddleware({ app });
  app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
  app.get("/playground", expressPlayGround({ endpoint: "/graphql" }));
  app.listen({ port: 4000 }, () => console.log("server start!!"));
};

startServer();
