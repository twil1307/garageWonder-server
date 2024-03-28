import Users from "../../models/user.model.js"

export const online = async (_id) => {
    console.log("CONNECT: ", _id)
    await Users.findByIdAndUpdate(_id, {
        $set: { isOnline: true }
    })
}

export const offline = async (_id) => {
    console.log("DISCONNECT: ", _id)

    await Users.findByIdAndUpdate(_id, {
        $set: {
            isOnline: false,
            lastActiveAt: new Date().getTime()
        }
    })
} 