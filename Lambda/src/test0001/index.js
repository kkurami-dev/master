const AWS = require('aws-sdk');
const sesv2 = new AWS.SESV2();

exports = {
  SuppressedDestination,
};

const listSuppressed = async (filter, Max) => {
  // var params = {
  //   EndDate: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789,
  //   NextToken: 'STRING_VALUE',
  //   PageSize: 'NUMBER_VALUE',
  //   Reasons: [
  //     BOUNCE | COMPLAINT,
  //     /* more items */
  //   ],
  //   StartDate: new Date || 'Wed Dec 31 1969 16:00:00 GMT-0800 (PST)' || 123456789
  // };
  let params = {};
  const exec = new Promise((resolve, reject) => {
    sesv2.listSuppressedDestinations(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(1);
        return;
      }
      console.log("1", data);           // successful response
      let retlist = [];
      for(let i = 0; i < data.SuppressedDestinationSummaries.length; i++ ){
        const ret = data.SuppressedDestinationSummaries[i];
        if(filter.test(ret.EmailAddress))
          retlist.push( ret.EmailAddress );
      }
      params.NextToken = data.NextToken;
      resolve( retlist );
    });
  });

  let loop = 0;
  let list = ['aaa@example.com'];
  do {
    await exec.then((err, data ) => Array.prototype.push.apply(list, data));
  } while(params.NextToken && loop++ < Max);
  console.log("listSuppressed ret len:", list.length);
  return list;
};

const deleteSuppressed = async (arr) => {
  for(let i = 0; i < arr.length; i++){
    await sesv2.deleteSuppressedDestination({
      EmailAddress: arr[i],
    }).promise();
  }
};

const putSuppressed = async (arr) => {
  for(let i = 0; i < arr.length; i++){
    await sesv2.sesv2.putSuppressedDestination({
      EmailAddress: arr[i],
      Reason: 'BOUNCE',
    }).promise();
  }
};

/**
 * パラメータ
 *   Filter : サプレッションリストのうち対象とするメールアドレスの正規表現
 *            指定がなければ「@」（全て）を表示
 *   Action : check : Files にマッチしたメールアドレスを返す
 *            del   : Files にマッチしたメールアドレスを削除する
 *            add   : Files を サプレッションリスト追加する
 *            add-reg : Files がマッチしたら、Filter をサプレッションリスト追加する
 *            指定がなければ check を実行
 *   Max : リスト取得の繰り返し回数（指定がなければ３回）
 */
async function SuppressedDestination(event, context, callback){
  let {Filter, Action, Max} = event;
  let re = null;
  let list = null;

  if( Filter )
    re = new RegExp(Filter);
  else
    re = new RegExp('@');
  if ( !Max ){
    Max = 3;
  }

  switch(Action){
  default:
  case 'check':
    return listSuppressed(re, Max);
  case 'del':
    list = await listSuppressed(re, Max);
    return deleteSuppressed(list);
  case 'add':
    return putSuppressed([Filter]);
  case 'add-reg':
    list = await listSuppressed(re, Max);
    if( list.length > 0 )
      return putSuppressed([Filter]);
  }
}
