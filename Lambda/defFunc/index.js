function gacha (config, rval) {
  let accum = 0;
  for (const entry of config) {
    for (const charID of entry.ids) {
      accum += entry.prob / entry.ids.length;
      if (rval < accum) return { id: charID };
    }
  }
  throw new Error('should not reach here');
}

async function getConfig() {
  return [
    {
      rarity: 5, // ★★★★★
      prob: 0.01,
      ids: [5001, 5002, 5003],
    },
    {
      rarity: 4, // ★★★★
      prob: 0.1,
      ids: [4001, 4002, 4003],
    },
    {
      rarity: 3, // ★★★
      prob: 0.89,
      ids: [3000, 3001, 3002],
    },
  ];
}

async function main() {
  const config = await getConfig();
  console.log(gacha(config, 0.001)); // 大当たり, キャラID 5001
  console.log(gacha(config, 0.004)); // 大当たり, キャラID 5002
  console.log(gacha(config, 0.04)); // あたり, キャラID 4001
  console.log(gacha(config, 0.7)); // はずれ
}

exports.handler = async (event) => {
  let res = await main();
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
    res,
  };
  return response;
};
