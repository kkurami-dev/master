////////////////////////////////////////
// React 関連
import React, {
  useState, useEffect, useCallback,
  //useMemo
} from "react";
import moment from 'moment';
import PropTypes from "prop-types";
import { QueryClient, QueryClientProvider,
         //useQuery
       } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Popover,
  Typography,
} from "@mui/material";

////////////////////////////////////////
// AWS 関連
import AWS from "aws-sdk";
//import { fromEnv } from "@aws-sdk/credential-providers";
//import { fromEnv } from "@aws-sdk/credential-provider-node";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/index.html
// Create service client module using ES6 syntax.
import * as clientS3 from "@aws-sdk/client-s3"; // ES Modules import
import * as cognito from "@aws-sdk/client-cognito-identity-provider";

// DynamoDB
import * as cdbobj from "@aws-sdk/client-dynamodb";
import * as ldbobj from "@aws-sdk/lib-dynamodb";
 
////////////////////////////////////////
// 内部モジュール
import { Sleep, setData } from "./data.js";
import "./App.css";
import "./css/main.css";
import { login, DynamoDBInit, S3Init } from "./aws-config/sdk-v3-api.mjs";

import Router from "./routes";

//import WheelPicker from './components/WheelPicker.js';
//import BasicTimePicker from './components/BasicTimePicker.js';

import { Button, TimePicker } from "antd";

//import Web3 from "web3";

////////////////////////////////////////
// 内部定数
//console.log("env", process.env);
//console.log("env", process.env.REACT_APP_COGNITO_CLIENT_ID);
//const COGNITO_CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID;
//const MY_USERNAME = process.env.REACT_APP_MY_USERNAME;
//const MY_PASSWORD = process.env.REACT_APP_MY_PASSWORD;

//let getDynamoDBl, login_obj;
let s3, getDynamoDBl, login_obj;

//const S3BUCKET = 'kkk-wss-test';
//const Web3 = require('web3');
const queryClient = new QueryClient();

function fromEnv(){
  return new AWS.Credentials(
    process.env.REACT_APP_AC,
    process.env.REACT_APP_SC
  );
}

/**
 * 
 */
let docClient = null;
const getDiffQuery = async ({
  key,
  limit,
}) => {
  // 外部モジュール
  if( !docClient ){
    const client = new DynamoDBClient({
      // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_credential_providers.html#fromini
      // https://zenn.dev/luma/articles/bd3c59b3d7682d
      credentials: fromEnv(),
      'region': 'ap-northeast-1',
    });
    docClient = DynamoDBDocumentClient.from(client);
  }
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-dynamodb/classes/querycommand.html
  // https://docs.aws.amazon.com/ja_jp/sdk-for-javascript/v3/developer-guide/javascript_dynamodb_code_examples.html
  const command = new QueryCommand({
    ...key,
    Limit: limit,
    ConsistentRead: true,
  });

  const response = await docClient.send(command);
  console.log(response);
  return response;
};

////////////////////////////////////////
function getDynamo() {
  if (!getDynamoDBl) {
    console.warn("getDynamo", getDynamoDBl);
  }
  const params = {
    TableName: "TestDB",
    Key: {
      BuildID: "b0001",
      now_time: 0,
    },
  };
  let ret = getDynamoDBl(params, (data) => {
    console.log(
      "getDynamo CB",
      data?.$metadata?.totalRetryDelay,
      data?.$metadata,
      data?.Item
    );
  });
  console.log("getDynamo ret", ret);
}
////////////////////////////////////////
function WorkerTest(){
  // react-window
  // react-virtualized
  // 
  const [worker, setWorker] = useState(null);
  const [msg, setMsg] = useState("");
  const [msg2, setMsg2] = useState(0);
  const [stop, setStop] = useState(false);

  const UICount = useCallback(async() => {
    for(let i = 0; i < 1000; i++){
      setMsg2( i );
      await Sleep( 6000 );
      if(stop) break;
    }
  }, [stop]);

  // 差分取得


  
  // 初期化と更新ハンドラ登録
  useEffect(()=>{
    const _worker = new Worker('worker.mjs');// public に worker.mjs を置く
    // Workerスレッドから受信設定
    _worker.onmessage = (event) => {
      console.log("<- onmessage:", event.data);
      setMsg(event.data.ret);
    };
    _worker.onerror = (event) => {
      console.error("<- onerror:", event);
    };
    setWorker(_worker);

    getDiffQuery({
      TableName: "TestDB",
      KeyConditionExpression:
      "BuildID = :di AND now_time > :nt",
      ExpressionAttributeValues: {
        ":di": "gasPrice",
        ":nt": 0,
      },
    }, 100);
  }, []);

  const wInit = useCallback(()=>{
    const conf = {
      // .env から設定を読み込み、workerスレッドに送信( .evn に記載 )
      ac: process.env.REACT_APP_AC,
      sc: process.env.REACT_APP_SC,
    };
    worker.postMessage({state:1, ...conf});
  }, [worker]);

  const wStart = useCallback(()=>{
    // Workerスレッドへ送信
    console.log("worker 開始");
    setData("Button Tap.");
    worker.postMessage({state:2, mail:"test@example.com ", max: 100000});
    UICount();
  }, [worker, UICount]);

  const wEnd = useCallback(()=>{
    worker.postMessage({ state: 9 });
    setStop( true );
  }, [worker]);

  const wDown = useCallback(()=>{
    // 終了
    worker.terminate();
  }, [worker]);

  const wShow = useCallback(()=>{
    sessionStorage.ui_data1 = moment();
    worker.postMessage({ state: 3 });
    setStop( true );
    sessionStorage.ui_data2 = moment();
  }, [worker]);

  return <div>
           <hr/>
           UIスレッド：{msg2}<br/>
           Workerスレッド：{msg}<br/>
           <button onClick={wStart}>ワーカー開始</button>
           <button onClick={wEnd}>ワーカー停止</button>
           <button onClick={wDown}>ワーカー終了</button>
           <br />
           <button onClick={wInit}>初期化</button>
           <button onClick={wShow}>状態確認</button>
           <hr/>
         </div>;
}

////////////////////////////////////////
function Test() {
  var params = {
    ExpressionAttributeValues: {
      ":s": 2,
      ":s2": 3,
      ":s3": 4,
      ":e": 9,
      ":topic": "PHRASE",
    },
    ExpressionAttributeName: {
      "#s": "Season",
      //'#s4': 'Season',
      "#e": "Episode",
      "#topic": "Subtitle",
    },
    KeyConditionExpression: "Season = :s and Episode > :e and bSeason = :s2",
    ProjectionExpression: "Episode, Title, Subtitle",
    FilterExpression: "contains(Subtitle, :topic) and contains(Season, :s3)",
    ConditionExpression: "if_not_exists(Season)",
    TableName: "EPISODES_TABLE",
    Key: {
      Season: 3,
      Episodde: 9,
    },
  };
  Decode(params);
}
function Decode(params) {
  const BrandID = "c000002";

  // 置き換え対処となる文字列の変更前、変更後
  let oldKey = "Season";
  let newKey = "BrandSeason";

  // 属性の変更対応メイン処理
  let reg1 = new RegExp(`\\b${oldKey}\\b`, "g"); // 単語単位に複数マッチする正規表現
  //let reg2 = new RegExp(`\\b${oldKey}\\b`, 'g');// 単語単位に複数マッチする正規表現
  let keys = [
    "ExpressionAttributeName",
    //'ExpressionAttributeValues', // 属性指定なし
    "KeyConditionExpression", // query
    "ProjectionExpression", // query, scan, get
    "FilterExpression", // query, scan
    "ConditionExpression", // update, put
    "UpdateExpression", // update
    "Item", // put
    "Key", // get
  ];

  // :key と #key の対応変換テーブルを作成
  const eav = params["ExpressionAttributeValues"];
  //const ean = params['ExpressionAttributeName'];

  // key を Brand + key に置き換えるループ
  //const ModMap = {};
  keys.forEach((str) => {
    let v = params[str];
    if (!v) return;

    if (typeof v === "string" || v instanceof String) {
      // 文字列中に key がある場合の置き換え
      if (v.match(reg1)) {
        params[str] = v.replace(reg1, newKey);
        // target :key なら ExpressionAttributeValues を置き換えが必要
        // こちらでかえたら、#key に対応した変換はどうするか
      }
    } else {
      for (let val in v) {
        // #key の中身のデータを置き換え
        if (v[val] === oldKey) {
          v[val] = newKey;

          // #key に対応する :key に BranIDを付加したに修正
          if (eav) {
            let k = val.replace(/^#/, ":");
            if (eav[k]) eav[k] = `${BrandID}-${eav[k]}`;
            else
              throw new Error(
                "複数商品券対応のため、ExpressionAttributeName に対応する ExpressionAttributeValues がない場合はエラー"
              );
          }
        }
        // key で設定された変数の置き換え、値には BrandID を付加
        if (val === oldKey) {
          v[newKey] = `${BrandID}-${v[val]}`;
          delete v[val];
        }
      }
    }
  });
  //console.log("mod param", params);
}

////////////////////////////////////////
//
async function getRevertReason(txHash, web3) {
  const tx = await web3.eth.getTransaction(txHash);
  var result = await web3.eth.call(tx, tx.blockNumber);
  result = result.startsWith("0x") ? result : `0x${result}`;
  if (result && result.substr(138)) {
    const reason = web3.utils.toAscii(result.substr(138));
    console.log("Revert reason:", reason);
    return reason;
  } else {
    console.log("Cannot get reason - No return value");
  }
  return "";
}

function MaticWeb3() {
  let a = 1;
  if (a) return;
  if (a) TestLogin();
  if (a) getRevertReason();
  const hash =
    "0xa3d4d493b7742a75b2208408214273dc2e04f5d76b1892a740d32cbda5bd334f";
  //const web3 = new Web3(Web3.givenProvider || 'wss://mainnet.infura.io/ws')
  //const web3 = new Web3(Web3.givenProvider || "https://rpc-mumbai.matic.today");
  const web3 = {};
  //const web3 = new Web3('https://rpc-mumbai.matic.today')
  web3.eth.getTransactionReceipt(hash, (error, result) => {
    console.log("1", result);
    //console.log(result.logs[0]);
    //const {topics} = result.logs[0]

    // Function selector
    // Offset of string return value
    // Length of string return value (the revert reason)
    // first 32 bytes of the revert reason
    // next 32 bytes of the revert reason
    // last 7 bytes of the revert reason
    //console.log("1", topics );

    // x
    // console.log(web3.utils.toAscii(topics[0]) );
    // console.log(web3.utils.toAscii(topics[1]) );
    // console.log(web3.utils.toAscii(topics[2]) );
    // console.log(web3.utils.toAscii(topics[3]) );
  });

  web3.eth.handleRevert = true;
  web3.eth.getTransactionReceipt(hash, (error, result) => {
    console.log("2", result);
  });

  //getRevertReason(hash, web3);
}

function MainTable({ cname }) {
  return (
    <table className={cname}>
      <caption>Council budget (in £) 2018</caption>
      <thead>
        <tr>
          <th colSpan="2">tItems</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Donuts</th>
          <td>{cname === "main" && <MainTable cname="sub" />}</td>
        </tr>
      </tbody>
    </table>
  );
}
MainTable.propTypes = {
  cname: PropTypes.string.isRequired,
};

function SelectTest() {
  const def = { age: 0, label: "全体", idx: 0 };
  const [List, SetList] = useState([def]);
  const [Idx, SetIdx] = useState(0);

  const handleChange = useCallback((e) => {
    console.log("handleChange", e.target, e.target.value);
    // let idx = Number( e.target.value );
    SetIdx(e.target.value.idx);
  }, []);

  const SetData = async () => {
    await Sleep(1000, () => {
      let list = [];
      for (let i = 0; i < 5; i++) {
        const nonNew = { age: i * 10, label: "No." + i, idx: i };
        list.push(nonNew);
      }
      //console.log("list:", list);
      SetIdx(0);
      SetList(list);
    });
  };

  useEffect(() => {
    SetData();
  }, []);
  
  return (
    <FormControl fullWidth>
      <InputLabel id="demo-simple-select-label">年齢</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={List[Idx]}
        label="Age"
        onChange={handleChange}
      >
        {List.map((item, idx) => (
          <MenuItem value={item} key={idx}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function ApiFetch() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    // https://memo.koumei2.com/react-から-fuelphp-apiをコールする際の-cors-回りのメモ/
    // https://omathin.com/react-api-2/
    let data = {
      test1: 1,
      test2: 2,
    };
    fetch(
      "https://jc4omtcknrxkjzvz46vhcc2toi0vlxmg.lambda-url.ap-northeast-1.on.aws/",
      {
        method: "POST",
        mode: "cors", //no-cors, *cors, same-origin,
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached,
        // credentials: 'same-origin', // include, *same-origin, omit
        // headers: {
        //   'Content-Type': 'application/json'
        //   // 'Content-Type': 'application/x-www-form-urlencoded',
        // },
        redirect: "follow", // manual, *follow, error
        referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify(data), // 本体のデータ型は "Content-Type" ヘッダーと一致させる必要があります
      }
    )
      .then((res) => res.json())
      .then((data) => {
        if (data) setPosts(data);
        //console.log("fetch:", data);
      });
  }, []);

  if (posts) return "";
  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

function TestLogin() {
  const { MY_USERNAME, MY_PASSWORD, COGNITO_CLIENT_ID } = {};
  if (!login_obj) {
    login_obj = 1;
    console.log("login 0 start");
    login(cognito, MY_USERNAME, MY_PASSWORD, COGNITO_CLIENT_ID, async () => {
      s3 = S3Init(clientS3);
      const { getDynamoDB, queryDynamoDB } = await DynamoDBInit(cdbobj, ldbobj);
      getDynamoDBl = getDynamoDB;
      console.warn("init end", queryDynamoDB);
      getDynamo();
    });
  }
}

async function ApiFetchCache() {
  const S3Param = {
    Bucket: "kkk-wss-test", //'保存したいバケット名',
    Key: "images/3107_830200000005h.jpg", //'キーを設定。取り出す際はこのキーで参照する',
    Body: "", //'保存したいオブジェクト本体'
    CASH: true, // Lambda が実行される EC2 の /tmp 領域にファイルをキャッシュする場合
  };

  const url =
    "https://jc4omtcknrxkjzvz46vhcc2toi0vlxmg.lambda-url.ap-northeast-1.on.aws/";
  FetchCache(
    url,
    {
      test1: 1,
      test2: 2,
    },
    S3Param,
    s3
  );
}

function FetchCache(url, param, data) {
  const [posts] = useState([]);

  if(!url) return "";
  if(url) return "";
  const fetchUsers = async () => {
    fetch(url, {
      param,
      method: "POST",
      mode: "cors", //no-cors, *cors, same-origin,
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached,
      // credentials: 'same-origin', // include, *same-origin, omit
      // headers: {
      //   'Content-Type': 'application/json'
      //   // 'Content-Type': 'application/x-www-form-urlencoded',
      // },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // 本体のデータ型は "Content-Type" ヘッダーと一致させる必要があります
    })
      .then((res) => res.json())
      .then((jdata) => {
        //if(0) setPosts(jdata);
        console.log("fetch:", data, jdata);
      });
  };
  //const { data } = useQuery(url, fetchUsers);
  fetchUsers();
  return (
    <div>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>{post.title}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * マウスオーバーインタラクション
 *   https://mui.com/material-ui/react-popover/
 */
function MouseOverPopover({ min, hover }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const handlePopoverOpen = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);
  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);
  const open = Boolean(anchorEl);

  if (min === 0) return hover;

  SelectTest();
  ApiFetch();
  ApiFetchCache();
  MaticWeb3();

  return (
    <div>
      <Typography
        aria-owns={open ? "mouse-over-popover" : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        {hover}
      </Typography>
      <Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: "none",
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >
        <Typography sx={{ p: 1 }}>{min}</Typography>
      </Popover>
    </div>
  );
}
MouseOverPopover.propTypes = {
  min: PropTypes.number.isRequired,
  hover: PropTypes.string.isRequired,
};

//function LodingModal(thisobj, msg, func) {
//
//
//}

//function HookUsage() {
//  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
//    useNumberInput({
//      step: 0.01,
//      defaultValue: 1.53,
//      min: 1,
//      max: 6,
//      precision: 2,
//    })
//
//  const inc = getIncrementButtonProps()
//  const dec = getDecrementButtonProps()
//  const input = getInputProps()
//
//  return (
//    <HStack maxW='320px'>
//      <Button {...inc}>+</Button>
//      <Input {...input} />
//      <Button {...dec}>-</Button>
//    </HStack>
//  )
//}

//function CheckBytes(param){
//  String.prototype.bytes = function () {
//    return(encodeURIComponent(this).replace(/%../g,"x").length);
//  }
//  //let str = JSON.stringify( param );
//}

function ESLintCheck() {
  // const [val, setVal] = useState(1);
  // const v3 = 0;
  // const [key, setKey] = useState("");
  // const cb1 = (v1, v2) => {
  //   setVal(v1);
  //   console.log("getDynamo ret", v1, v2);
  // };
  // const cb2 = (v1, v2) => console.log("getDynamo ret", v1, v2);
  // const cb22 = () => <div>これでも良いはず</div>;
  // const cb3 = function (v1, v2) {
  //   // 関数の場合
  //   return v1 + v2;
  // };
  // function cb33(e) {
  //   let v1 = e.terget.value;
  //   // 関数の場合
  //   return v1 + val;
  // }
  // const Tag3 = () => (
  //   <div>
  //     <button onClick={(e) => cb2(e)} type="button" id={cb1 || 3}>
  //       ログを出すボタン
  //     </button>
  //     <button onClick={(e) => cb22()} type="button" id={cb1 || 3}>
  //       文字を出すボタン
  //     </button>
  //   </div>
  // );
  // const cb4 = useCallback((v1, v2) => {
  //   setKey(v1 + v2 + val);
  //   return v1 + v2 + val;
  // }, []);
  // const cb5 = useCallback(
  //   (v1, v2) => {
  //     console.log("cb5 exec", v1, v2);
  //     return val + key;
  //   },
  //   [key]
  // );

  // const Tag2 = () => (
  //   <div>
  //     <button onClick={cb1} data-val={val} />
  //   </div>
  // );
  // // <button onClick={cb5(1, 2)}>表示時点でCBが動作している</button>
  // const testdata = (
  //   <div>
  //     <Tag2 />
  //     <Tag3 />
  //     <button onClick={cb3} />
  //     <button onClick={(e) => cb3(e, v3)} />
  //     <button onClick={(e) => cb4(1, 2)} />
  //     <button onClick={(e) => cb5(1, 2)}>押した時動く</button>

  //     <button
  //       onClick={(e) => {
  //         console.log(e, val);
  //         return "a" + e.target.value;
  //       }}
  //     />
  //     <button
  //       onClick={(e) => {
  //         let val = e.target.value;
  //         setVal(val);
  //       }}
  //     />
  //     <button onClick={(e) => <p>これでもよいはず２</p>} />
  //     <button onClick={(e) => <p>これでもよいはず３</p>} />
  //     <button onClick={(e) => <p>これでもよいはず４</p>} />
  //   </div>
  // );
  // //return testdata;
  // return "";
}

function TY(param){
  const {str} = param;
  const type = typeof str;
  console.log("in", param);
  return <p>{""+str}:{type}</p>;
}

const App = () => {
  //const date = new Date()
  //const year = date.getFullYear()
  //const DATE = {
  //  Days: [...Array(31)].map((u, i) => i + 1),
  //  Months: [...Array(12)].map((u, i) => i + 1),
  //  Years: [...Array(120)].map((u, i) => year - i),
  //}
  //const DELIMITERS = ['/', '/']

  const [open, setOpen] = useState(false);
  const onHander1 = useCallback(() => {
    setOpen(false);
  }, []);
  const onHander2 = useCallback(
    () => (
      <Button size="small" type="primary" onClick={onHander1}>
        OK
      </Button>
    ),
    [onHander1]
  );

  Test();
  //const data = { page:'App', inLoggedIn:false };
  //const routing = useRoutes(routes3, {data});
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <h1>useRoutes Example</h1>
        <TimePicker
          open={open}
          onOpenChange={setOpen}
          renderExtraFooter={onHander2}
        />
        <TY str="1"/>
        <TY str={0}/>
        <TY str={undefined}/>
        <TY str={null}/>
        <TY str={false}/>
        <TY str={true}/>
        <Router />
        <ESLintCheck />
        <MouseOverPopover min={1} hover={"a"} />
      </div>
      <WorkerTest />
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
};
export default App;
