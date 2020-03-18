// -*- coding: utf-8-unix -*-
// <https://aboutreact.com/custom-navigation-drawer-sidebar-with-image-and-icon-in-menu-options/>
// メニューオプションに画像とアイコンを備えたカスタムナビゲーションドロワー/サイドバー
//This is an example code for Navigation Drawer with Custom Side bar//
import React, { Component, useState, useEffect } from 'react';
import { View, StyleSheet, Image, Text, Animated, Easing, Dimensions } from 'react-native';
import { Icon } from 'react-native-elements';


export default class CustomSidebarMenu extends Component {
  constructor(props) {
    super(props);
    //Setting up the Main Top Large Image of the Custom Sidebar
    this.proileImage =
      'https://reactnative.dev/img/header_logo.svg';

    this.items = [
      {
        navLavel: 'メンバー',           // ラベル
        navOptionThumb: 'camera',       // アイコン
        navOptionName: 'First Screen',  // 項目名称
        screenToNavigate: 'DrawerHome', // 遷移先
      }, {
        navLavel: '',
        navOptionThumb: 'image',
        navOptionName: 'Second Screen',
        screenToNavigate: 'DrawerPageOne',
      }, {
        // 遷移先がないため、押しても反応しないメニュー
        navLavel: '',
        navOptionThumb: 'build',
        navOptionName: 'Third Screen',
        screenToNavigate: 'NavScreen3',
      },
    ];
    this.sourceImg = require('../assets/Icon-Small.png');

    // コンストラクタでアニメーション部品を作成
    this.RotateValueHolder = new Animated.Value(0);

    this.state = {
      data_d: 0,
      data1: '0',
    };
  }

  componentDidUpdate( prevProps ){
     if(this.props.name !== prevProps.name) {
        // do something.
     }
  }

  componentDidMount() {
    console.log("CustomSidebarMenu.js componentDidMount ----------------------------------------");
    console.log(this);
    // 画面作成後から回転を始める
    this.StartImageRotateFunction();
  }

  // 画像回転のメイン関数
  StartImageRotateFunction() {
    // 定期的にこの関数は実行される
    //console.log("CustomSidebarMenu.js StartImageRotateFunction() ----------------------------------------");
    //console.log(this);

    // １回転分の設定を実施
    this.RotateValueHolder.setValue(0);
    Animated.timing(this.RotateValueHolder, {
      toValue: 1,
      duration: 6000,
      easing: Easing.linear,
    }).start(() => this.StartImageRotateFunction());
  }
  
  _getImg = () => {
    console.log("CustomSidebarMenu.js _getImg ----------------------------------------");
    console.log(this);
    return 'https://static.javatpoint.com/tutorial/reactjs/images/reactjs-home.png';
    //return require('../assets/Icon-Small.png');
    // source={this.sourceImg}
    // source={{uri: 'https://reactnative.dev/img/header_logo.svg'}}
    // source={{ uri: this.proileImage }}
  }
  
  render() {
    let data1 = this.props.data1;
    console.log("CustomSidebarMenu.js render ----------------------------------------");
    console.log(this);
    console.log(data1);
    
    // 回転のパラメータ
    const RotateData = this.RotateValueHolder.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });
    console.log(RotateData);
    console.log(this.RotateValueHolder);


    // こちらだと this 無しでアクセス可能
//    let sourceImg = require('../assets/Icon-Small.png');

    return (
      <View style={styles.sideMenuContainer}>
        {/*Top Large Image */}
         <View style={{flexDirection: 'row'}}>
          <Image
            style={styles.sideMenuProfileIcon}
            source={{ uri: 'https://static.javatpoint.com/tutorial/reactjs/images/reactjs-home.png' }}
          />
           <View style={styles.sideMenuRotateIcon}>
             <Animated.Image
               style={{width: 50,
                       height: 50,
                       transform: [{ rotate: RotateData }],
                      }}
               source={ require('../assets/Icon-Small.png') }
             />
           </View>
        </View>

        {/*Divider between Top Image and Sidebar Option*/}
        <View
          style={{
            width: '100%',
            height: 1,
            backgroundColor: '#e2e2e2',
            marginTop: 15,
          }}
        />
        {/*Setting up Navigation Options from option array using loop*/}
        <View style={{ width: '100%' }}>
          {/* key はユニークなＩＤになる */}
          {this.items.map((item, key) => (
            <View key={key} >
              {/* 文字列があればラベルの表示を行う */}
              <View >
                <Text
                  style={{
                    backgroundColor: 'gray',
                    fontSize: 15,
                    color: 'black',
                  }}>
                  {item.navLavel}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingTop: 10,
                  paddingBottom: 10,
                  // 選択されていれば色を変更
                  // 「{{」の中のためコメントに「{」が要らない
                  backgroundColor: global.currentScreenIndex === key ? '#e0dbdb' : '#ffffff',
                }}
                key={key}>
                <View style={{ marginRight: 10, marginLeft: 20 }}>
                  <Icon name={item.navOptionThumb} size={25} color="#808080" />
                </View>
                <Text
                  style={{
                    fontSize: 15,
                    // 選択されていれば色を変更
                    color: global.currentScreenIndex === key ? 'red' : 'black',
                  }}
                  onPress={() => {
                    /* 選択位置を保持する */
                    global.currentScreenIndex = key;
                    this.props.navigation.navigate(item.screenToNavigate);
                  }}>
                  {item.navOptionName}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  sideMenuContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingTop: 20,
  },
  sideMenuProfileIcon: {
    resizeMode: 'center',
    width: 50,
    height: 50,
    marginTop: 20,
    borderRadius: 150 / 2,
  },
  sideMenuRotateIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#C2C2C2',
  },
});
