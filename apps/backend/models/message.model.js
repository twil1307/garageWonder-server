import mongoose from "mongoose";
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Rooms",
  }, 
	content: {
		type: String,
		require: true,
	},
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  images: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Image",
    default: [],
  },
	replyFrom: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Messages",
		default: undefined
	},
	isSticked: {
		type: Boolean,
		default: false
	},
  createdAt: {
    type: Number,
  },
  updatedAt: {
    type: Number,
  },
});

messageSchema.pre("save", function (next) {
  this.createdAt = new Date().getTime();
  this.updatedAt = new Date().getTime();
  next();
});

const Message = mongoose.model("Messages", messageSchema);

export default Message;
