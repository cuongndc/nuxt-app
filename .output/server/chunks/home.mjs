import { defineEventHandler } from 'h3';
import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGODB_URI, {});
const mongo = client;

const collections = {
  chapters: "chapters",
  comics: "comics",
  homePages: "homepages",
  chapterPages: "chapter-pages"
};

const home = defineEventHandler(async () => {
  return await mongo.db().collection(collections.homePages).find({}).sort({
    orderIndex: 1
  }).limit(12).toArray();
});

export { home as default };
//# sourceMappingURL=home.mjs.map
