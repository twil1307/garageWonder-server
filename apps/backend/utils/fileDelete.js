import { promises as fs } from "fs";

const deleteFiles = async (filePaths) => {
  try {
    await Promise.all(filePaths.map((filePath) => fs.unlink(filePath)));
    console.log("All files deleted successfully");
    // Perform any additional actions after successful deletion
  } catch (error) {
    console.error("Error deleting files", error);
    // Handle the error accordingly
  }
};

export default deleteFiles;
