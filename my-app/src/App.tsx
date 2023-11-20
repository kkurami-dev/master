import * as React from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';

import './App.css';
import PrivateRoute from './components/PrivateRoute.tsx';
import { useAuth } from './hooks/use-auth.tsx';
import { SignIn } from './pages/SignIn.tsx';

// DynamoDB
import { FetchHttpHandler } from "@aws-sdk/fetch-http-handler";
import * as cdbobj from "@aws-sdk/client-dynamodb";
import * as ldbobj from "@aws-sdk/lib-dynamodb";

import {
  DynamoDBInit,
  //S3Init
} from './aws-config/sdk-v3-api.mjs';

const REGION = process.env.REACT_APP_REGION || 'ap-northeast-1';// リージョンの取得
const requestHandler = new FetchHttpHandler({
  /*number in milliseconds*/
  requestTimeout: 100,
  socketTimeout: 200,
});

let { getDynamoDB, queryDynamoDB } = {};
////////////////////////////////////////
function getDynamo(){
  if(!getDynamoDB){
    console.warn('getDynamo', getDynamoDBl);
  }
  const params = {
    TableName: "TestDB",
    Key:{
      BuildID: "b0001",
      now_time: 0
    }
  };
  let ret = getDynamoDB(params, (data)=>{
    console.log('getDynamo CB',
                data?.$metadata?.totalRetryDelay,
                data?.$metadata,
                data?.Item);
  });
  console.log('getDynamo ret', ret);
}

////////////////////////////////////////
function App() {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div></div>;
  }

  const TopPage = () => {
    return (
      <div>
        <p>トップページ</p>
        <p>{auth.isAuthenticated ? 'ログイン済' : '未ログイン'}</p>
        <p>
        <Link to="/signin">ログイン</Link>
        </p>
        </div>
    );
  };

  const PrivateDashboard = () => {
    let location = useLocation();

    /* React.useEffect(() => {
     *   // Google Analytics
     *   //ga('send', 'pageview');
     *   console.log('Dashboard auth', auth);
     *   console.log('Dashboard location', location);
     *   if( auth.username ){
     *     const aws_config_low = {
     *       maxAttempts: 20,
     *       region: REGION,
     *       requestHandler: requestHandler_low,
     *       //credentials
     *     };
     *     const db = DynamoDBInit(cdbobj, ldbobj);
     *     getDynamoDB = db.getDynamoDB;
     *     queryDynamoDB = db.queryDynamoDB;

     *     getDynamo();
     *   }
     * }, [location]); */

    return (
      <PrivateRoute>
        <div>ようこそ！ {auth.username} さん！</div>
        <button onClick={() => auth.signOut()}>ログアウト</button>
      </PrivateRoute>
    );
  };

  return (
    <BrowserRouter>
      <Routes>
      <Route index element={<TopPage />} />
      <Route path="signin" element={<SignIn />} />
      <Route path="dashboard" element={<PrivateDashboard />}></Route>
      <Route path="*" element={<p>Page Not Found</p>} />
      </Routes>
      </BrowserRouter>
  );
}

export default App;
