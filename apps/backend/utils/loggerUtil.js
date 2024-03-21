import Logger from "../models/logger.model.js";

export const logActionForAddStaff = (executorId, targetId) => {
    const actionLog = new Logger({executorId, targetId});
    actionLog.createdAt = new Date().getTime();
    actionLog.actionDescription = `${executorId} assign ${targetId} as a staff`

    console.log(actionLog);
};