import mongo from '~/server/mongo'
import { collections } from '~/contants'
import axios from 'axios'

export default defineEventHandler(async () => {
    const response  = await axios.get('/api/wb/homepage', {
        baseURL: 'https://nuxt-truyen-service.herokuapp.com',
    })

    console.log("response", response.data)
    return response.data.data
    // return await mongo.db().collection(collections.homePages).find({}).sort({
    //     orderIndex: 1,
    // }).limit(12).toArray()
})
