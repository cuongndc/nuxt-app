import axios from 'axios'

export default defineEventHandler(async () => {
    const response  = await axios.get('/api/wb/homepage', {
        baseURL: 'https://nuxt-truyen-service.herokuapp.com',
    })

    console.log("response", response.data)
    return response.data.data
})
