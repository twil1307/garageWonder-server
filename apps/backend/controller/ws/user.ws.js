import Users from "../../models/user.model.js"

export const online = async (user) => {

    await Users.findByIdAndUpdate(user._id, {
        $set: {
            isOnline: true
        }
    })
}

export const offline = async (socket) => {

    await Users.findByIdAndUpdate(user._id, {
        $set: {
            isOnline: false,
            lastActiveAt: new Date().getTime()
        }
    })
} 