const fetch = require("node-fetch");
const { authorizeWithGithub } = require("../lib");

module.exports = {
  async postPhoto(parent, args, { db, currentUser }) {
    if (!currentUser) {
      throw new Error(`only an authorized user can post a photo`);
    }
    const newPhoto = {
      ...args.input,
      userID: currentUser.githubLogin,
      created: new Date(),
    };
    console.debug("post Photo :", newPhoto);
    const { insertedId } = await db.collection(`photos`).insertOne(newPhoto);
    console.debug("inserted", insertedId);
    newPhoto.id = insertedId;
    return newPhoto;
  },

  async githubAuth(parent, { code }, { db }) {
    let { message, access_token, avatar_url, login, name } =
      await authorizeWithGithub({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code,
      });

    if (message) {
      throw new Error(message);
    }

    let latestUserInfo = {
      name,
      githubLogin: login,
      githubToken: access_token,
      avatar: avatar_url,
    };

    const {
      ops: [user],
    } = await db
      .collection("users")
      .replaceOne({ githubLogin: login }, latestUserInfo, { upsert: true });

    return { user, token: access_token };
  },
};
