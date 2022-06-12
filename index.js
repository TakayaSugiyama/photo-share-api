const { ApolloServer } = require("apollo-server-express");
const { PubSub } = require("graphql-subscriptions");
const express = require("express");
const expressPlayGround =
  require("graphql-playground-middleware-express").default;
const { readFileSync } = require("fs");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const { WebSocketServer } = require("ws");
const { useServer } = require("graphql-ws/lib/use/ws");
const { createServer } = require("http");
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { makeExecutableSchema } = require("@graphql-tools/schema");

const typeDefs = readFileSync("./type.graphql", "UTF-8");
const resolvers = require("./resolvers");

const startServer = async () => {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers });
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });
  const serverCleanup = useServer({ schema }, wsServer);

  const MONGO_DB = process.env.DB_HOST;
  const client = new MongoClient(MONGO_DB, { useNewUrlParser: true });
  await client.connect();
  const db = client.db();
  console.log("Connected successfully to server");
  const pubsub = new PubSub();
  const server = new ApolloServer({
    schema,
    context: async ({ req, connection }) => {
      const githubToken = req
        ? req.headers.authorization
        : connection.context.Authorization;
      const currentUser = await db.collection("users").findOne({ githubToken });
      return { db, currentUser, pubsub };
    },
    csrfPrevention: true,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();
  server.applyMiddleware({ app });
  app.get("/", (req, res) => res.end("Welcome to the PhotoShare API"));
  app.get(
    "/playground",
    expressPlayGround({
      endpoint: "/graphql",
    })
  );
  httpServer.listen({ port: 4000 }, () => console.log("server start"));
};

startServer();
