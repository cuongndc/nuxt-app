export const PageTypes = {
    _banner: 'banner',
    _cover: 'cover',
    _menu: 'menu',
    _trend: 'trend',
    _representCategory: 'representCategory',
    _recommendation: 'recommendation',
    _newest: 'newest',
    _comingSoon: 'comingSoon',
    _funtoonChoice: 'funtoonChoice',
}

export interface IHomePage {
    _id: string
    type: 'banner' | 'cover' | 'menu' | 'trend' | 'representCategory' | 'recommendation' | 'newest' | 'comingSoon' | 'funtoonChoice'
    typeName: string
    content: []
    orderIndex: number
}

interface Animation {
    direction: string
    distance: number
    duration: number
    image: string
}

interface Cover {
    _id: string
    comicName: string
    active: boolean
    adultContent: boolean
    animations: Animation[]
    author: []
    type: string
    slug: string
    link: string
}

export interface IBanner {
    _id: string
    covers: Cover[]
    description: string
}
