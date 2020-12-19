import axios from 'axios';

var AWS = require('aws-sdk');
const API_BASE_URL = 'https://4r3ki42pi3.execute-api.ap-northeast-1.amazonaws.com/prod/';

export function getDataFromApi() {
  let params = {
    params: { address: this.state.place },
  };
  
  console.log(API_BASE_URL + "", params)
  return;
  // APIをコール
  console.log(API_BASE_URL + "", params)
  axios.get(API_BASE_URL + "", params)
    .then((response) => {
      console.log(response)
      // APIから取得したデータをstateに保存
      this.setState({
        message: response.data.message
      });
    })
  axios.post(API_BASE_URL + "", params)
    .then((error, response) => {
      console.log(error, response)
      // APIから取得したデータをstateに保存
      this.setState({
        message: response.data.message
      });
    })
}  
