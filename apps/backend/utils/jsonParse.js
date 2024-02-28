const unParsedAttrs = ["lng", "lat", "distance"]

export const parseQueryParams = (queryParams) => {
    const parsedParams = {};
  
    for (const key in queryParams) {
        if (unParsedAttrs.includes(key)) {
            parsedParams[key] = queryParams[key];
            continue;
        }

        if (queryParams.hasOwnProperty(key)) {
            parsedParams[key] = parseJSONOrDefault(queryParams[key]);
        }
    }
  
    return parsedParams;
};
  
export const parseJSONOrDefault = (jsonString) => {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      return jsonString;
    }
};
  