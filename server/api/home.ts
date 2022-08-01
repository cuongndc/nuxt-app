import mongo from '~/server/mongo'
import { collections } from '~/contants'

export default defineEventHandler(async () => {
    return await mongo.db().collection(collections.homePages).find({}).sort({
        orderIndex: 1,
    }).limit(12).toArray()
})
