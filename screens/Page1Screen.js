// -*- coding: utf-8-unix -*-
const VERSION='Time-stamp: "2020-07-07 22:24:19 kuramitu"';

import Storage from 'react-native-storage';
import React, { Component, useCallback, useEffect, useState, AsyncStorage } from 'react';
import {
  Text, TouchableOpacity,
  Animated, View, Easing,
} from 'react-native';
import { Card, Button, FormLabel, FormInput } from "react-native-elements";
import axios from 'axios';

const ConfigJson = require('../env.json');

import { mystyle } from './Common';
import CustomSidebarMenu from './CustomSidebarMenu';

const backgroundImage = require('../assets/Icon-Small.png')

////////////////////////////////////////////////////////////////////////////////
function Example() {
  // Declare a new state variable, which we'll call "count"
  //const [count, setCount] = useState(0);

  // return (
  //   <View >
  //     <Text>You clicked {count} times</Text>
  //     <Button onPress={() => setCount(count + 1)}>
  //       Click me
  //     </Button>
  //   </View>
  // );

  return (null);
};

export default class Page1Screen extends Component {
  constructor(props) {
    super(props);
    this.animatedValue = new Animated.Value(0);
    // コンストラクタでアニメーション部品を作成
    this.RotateValueHolder = new Animated.Value(0);

    this.state = {
      data2: '888',
    };
  }

  // 
  handleAnimation = () => {
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: 1000,
      easing: Easing.ease
    }).start()
  }

  componentDidMount() {
    console.log("Page1Screen.js componentDidMount ----------------------------------------");
    console.log(this);
    this.StartImageRotateFunction();
  }

  componentDidUpdate() {
    console.log('P1S0 componentDidUpdate now!')
  }

  shouldComponentUpdate() {
    console.log('P1S0 shouldComponentUpdate now!')
    return true;
  }

  StartImageRotateFunction() {
    this.RotateValueHolder.setValue(0);
    Animated.timing(this.RotateValueHolder, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear,
    }).start(() => this.StartImageRotateFunction());
  }

  authPost = () => {

    //受け取り側が素のPHP($_POST['']なのでstringifyする)
    //Laravelとかならいらない
    var qs = require('qs');

    axios
      .post('http://localhost/auth/api.php',
            qs.stringify({
              email: this.state.email,
              password: this.state.password
            }))
      .then((res) => {
        if(res.data.auth){
          alert('認証OK');
        }else{
          alert('認証NG');
        }
      })
      .catch(error => console.log(error));
  }
  
  render() {
    console.log("Page1Screen.js render ----------------------------------------");
    console.log(this);

    // const [value, setValue] = React.useState('');
    // const onChange = event => {
    //   localStorage.setItem('myValueInLocalStorage', event.target.value);
    //   setValue(event.target.value);
    // };

    // 回転のパラメータ
    const RotateData = this.RotateValueHolder.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <View style={mystyle.container}>
        <View style={mystyle.container1} >
          <Text>Page1Screen</Text>
          <View style={ mystyle.button }>
            <Button title="go to Detail"
                    onPress={() => {
                      this.props.navigation.navigate('Page1Detail')
                    }}
            />
          </View>
          <Button title="go to Detail" style={ mystyle.button }
                  onPress={() => {
                    this.props.navigation.navigate('Page1Detail')
                  }}
          />
          <View style={ mystyle.button }>
            <Button title="go to Page1Spinner"
                    onPress={() => {
                      this.props.navigation.navigate('Page1Spinner')
                    }}
            />
          </View>
          <View style={ mystyle.button }>
            <Button title="go to Page1Spinner"
                    onPress={() => {
                      this.props.navigation.navigate('Page1Spinner')
                    }}
            />
          </View>

          {
            Example()
          }
          <TouchableOpacity onPress={this.handleAnimation}>
            <Text>Transform</Text>
          </TouchableOpacity>
          <Animated.Image
            source={backgroundImage}
            resizeMode='cover'
            style={{
              position: 'absolute',
              left: 40,
              top: 100,
              height: 20,
              width: 20,
              transform: [{
                translateX: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 120]
                })
              }, {
                translateY: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 25]
                })
              }, {
                scaleX: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 15]
                })
              }, {
                scaleY: this.animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 12.5]
                })
              }]
            }}
          />
        </View>
        
        {/* 回転する部品の表示 */}
        <View style={mystyle.container2}>
          <Animated.Image
            style={{
              width: 200,
              height: 200,
              transform: [{ rotate: RotateData }],
            }}
            source={{
              uri:
              'https://raw.githubusercontent.com/AboutReact/sampleresource/master/old_logo.png',
            }}
          />
        </View>
        {
          /* デバッグが有効な場合はバージョンが表示される */
          ConfigJson.debug
            ? (<Text>{VERSION} / { ConfigJson.version }</Text>)
            : null
        }
      </View>
    )
  }
}
