import { updateLayers } from "./UpdateLayers.mjs";

const FuncMap = {
  updateLayers,
};

export const handler = async (event, context) => {
  const param = {};
  Object.assign( param, {layer:"crypto", ver:3 }, event );
  return await FuncMap[ event.func ]( param );
};
