/* eslint-disable react/jsx-no-bind */
import React from "react";
import {
  useNavigate,
  useLocation,
  //useParams,
  //useRoutes
} from "react-router-dom";

import {setData} from '../data.js';

export default function SamplePage2(
  // props
){
  // const { id } = useParams();
  // const { data } = useRoutes();
  const location = useLocation();
  const navigate = useNavigate();

  //console.log("location",  location,  location.state, id);

  const handleClick1 = () => {
    location.state.data.id = 20;
    //const data = { message: 'Hello world!' };
    //props.onNavigate(data);

    console.log("SamplePage2 Click1");
    setData('b');
    navigate(-1);
  }
  const handleClick2 = () => {
    console.log("SamplePage2 Click2", location.state.data, location);
    // let ret = props.onNavigate();
    // console.log("SamplePage2", ret);
    // ret.a = 'SamplePage2';
  }

  return (
    <>
      <h3>サンプルページ 2</h3>
      <button onClick={handleClick1}>戻る</button>
      <button onClick={handleClick2}>表示</button>
    </>);
}
