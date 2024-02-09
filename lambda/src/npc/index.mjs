// Time-stamp: "2024-01-18 21:21:59 kuramitu"
import { selectPosition } from "./selectPosition.mjs";

export const handler = async (event) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};
