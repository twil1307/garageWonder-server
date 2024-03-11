export const getNotiPagination = (garages, limitNum) => {
    let cursorRes = null;
    let nextCursorResp = null;
    let respGarage = null;
  
    if(limitNum < garages.length) {
      cursorRes = garages[0].createdAt;
      nextCursorResp = garages[garages.length - 1].createdAt;
      respGarage = garages.slice(0, -1);
    }
  
    if(limitNum >= garages.length) {
      cursorRes = garages[0].createdAt;
      nextCursorResp = null
      respGarage = garages;
    }
  
    return {
      cursorRes,
      nextCursorResp,
      respGarage,
    }
  }