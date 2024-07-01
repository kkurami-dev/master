import { updateLayers } from './UpdateLayers.mjs';
import { deleteDynamodb } from './DeleteDynamoDB.mjs';

const FuncMap = {
  updateLayers,
  deleteDynamodb,
};

export const handler = async (event, context, callback) => {
  const param = {};
  Object.assign(param, { layer: 'crypto', ver: 3 }, event);
  return FuncMap[event.func](param, context, callback);
};
