export const retrieveNewGarageImage = (req) => {
  const backgroundImage = req.files['backgroundImage'][0].path || null;
  const garageImages = req.files['garageImage']?.map(image => image.path) || [];
  
  return { backgroundImage, garageImages };
};
  
export const retrieveAllNewGarageImagePath = (req) => {
  let backgroundImage = "";
  if (req.files["backgroundImage"] && req.files["backgroundImage"].length > 0) {
    backgroundImage = req.files["backgroundImage"][0].path.replaceAll(
      "\\",
      "/"
    );
  }

  const hotelImages =
    req.files["garageImage"]?.map(({ path }) => path.replaceAll("\\", "/")) ||
    [];
  // const viewImages =
  //   req.files["viewImage"]?.map(({ path }) => path.replaceAll("\\", "/")) || [];

  // const imagePaths = [...hotelImages, ...viewImages]; // Combine the arrays

  if (!backgroundImage || backgroundImage.length != 0) {
    hotelImages.push(backgroundImage);
  }

  return hotelImages;
};