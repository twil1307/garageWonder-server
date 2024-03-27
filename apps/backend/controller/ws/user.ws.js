import Users from "../../models/user.model"

export const online = async (user) => {
    await Users.findByIdAndUpdate(user._id, {
        $set: {
            isActive: true
        }
    })
}

export const offline = async (socket) => {
    
} 