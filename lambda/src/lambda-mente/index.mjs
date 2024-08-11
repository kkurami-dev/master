import { updateLayers } from './UpdateLayers.mjs';
import { deleteDynamodb } from './DeleteDynamoDB.mjs';
import { exportLogs } from './cloudwatchlog-export.mjs';

const FuncMap = {
  updateLayers,
  deleteDynamodb,
  exportLogs,
};

export const handler = async (event, context, callback) => {
  const param = {};
  Object.assign(param, { layer: 'crypto', ver: 3 }, event);
  return FuncMap[event.func](param, context, callback);
};
