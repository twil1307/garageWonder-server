export const extraFeeEnum = ["cleaning", "extraGuest", "weekend"];

export const HOME_IMAGE_SIZE = {
    width: 320,
    height: 320
}

export const DETAIL_IMAGE_PREVIEW_SIZE = {
    width:  680,
    height: 450
}

export const DETAIL_IMAGE_SIZE = {
    width: 1280,
    height: 960
}

export const TOTAL_IMAGE_SIZE = [
    HOME_IMAGE_SIZE,
    DETAIL_IMAGE_PREVIEW_SIZE,
    DETAIL_IMAGE_SIZE
]

export const EVALUATION_IMAGE_SIZE = [
    DETAIL_IMAGE_SIZE
]

export const IMAGE_UPLOADING_STATUS = {
    INITIAL: 0, // not upload image yet
    PENDING: 1, // uploading
    SUCCESS: 2, // uploaded
    FAIL: 3 // failed
}

export const ITEMS_PER_CURSOR = 2;

export const CACHING_CREATING_GARAGE_TIME = 60 * 60 // 60 min