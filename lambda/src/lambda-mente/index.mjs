import { updateLayers } from "./UpdateLayers.mjs";
import { deleteDynamodb } from "./DeleteDynamoDB.mjs";

const FuncMap = {
  updateLayers,
  deleteDynamodb,
};

export const handler = async (event, context) => {
  const param = {};
  Object.assign( param, {layer:"crypto", ver:3 }, event );
  return await FuncMap[ event.func ]( param );
};
