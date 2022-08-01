import { TRUYEN_TRANH } from '~/contants/path'

export default function useNavigatorComicPreview(slug: string, _id: string) {
    return `/${TRUYEN_TRANH}/${slug}/${_id}`
}
