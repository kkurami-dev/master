// -*- coding: utf-8-unix -*-
'use strict';

import React, { Component, useCallback, useEffect } from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import { createStackNavigator } from 'react-navigation-stack';
import { createDrawerNavigator, DrawerActions, useIsDrawerOpen  } from 'react-navigation-drawer';
import { hideNavigationBar } from 'react-native-navigation-bar-color';
import Config from 'react-native-config';

import CustomSidebarMenu from './CustomSidebarMenu';

import Page1ScreenJS from './Page1Screen';
import Page1Spinner from './Page1Spinner';
import Single1 from './Single1';
import Single2 from './Single2';
import Page1DetailScreen from './Page1DetailScreen';
import Page1DetailScreen2 from './Page1DetailScreen2';


////////////////////////////////////////////////////////////////////////////////
// 画面間データ
const state = {
  data_org: '000',
}


////////////////////////////////////////////////////////////////////////////////
// Drawer
const LeftDrawer1 = createDrawerNavigator(
  {
    DrawerHome: {
      screen: Page1ScreenJS,
      navigationOptions: ({ navigation }) => {
        console.log('Page1Screen_Main.js LeftDrawer1 DrawerHome navigationOptions');
        console.log(navigation);
        //navigation.openDrawer();
        //navigation.toggleDrawer();
      }},
    DrawerPageOne: Single1,
    DrawerPageTwo: Single2,
  },
  {
    initialRouteName: 'DrawerHome',
    //For the Custom sidebar menu we have to provide our CustomSidebarMenu
    contentComponent: CustomSidebarMenu,
    drawerWidth: 200,
    navigationOptions: ({ navigation }) => {
      console.log('Page1Screen_Main.js LeftDrawer1 navigationOptions ----------------------------------------');
      console.log(navigation);
      console.log(this);
      console.log(DrawerHome);

      return navigation;
    },
    getScreenOptions: (navigation, screenProps, theme )=>{
      console.log('Page1Screen_Main.js LeftDrawer1 getScreenOptions ----------------------------------------');
      console.log(navigation);
      console.log(screenProps);
      console.log(theme);
      console.log(DrawerHome);
    },
  }
);

////////////////////////////////////////////////////////////////////////////////
// setting main nav
const MainStack =  createStackNavigator(
  {
    Page1Home: {
      screen: LeftDrawer1,
      navigationOptions: ({ navigation }) => ({
        title: 'ホーム',
        headerLeft: () => {
          return (<Icon name="bars"
                        size={24}
                        onPress={() => navigation.toggleDrawer()}
                        style={{ paddingLeft: 20 }}
                  />);
        },
      }),
    },
    Page1Detail: {
      screen: Page1DetailScreen,
      header: ({ scene, previous, navigation }) => {
        const { options } = scene.descriptor;
        const title =
              options.headerTitle !== undefined
              ? options.headerTitle
              : options.title !== undefined
              ? options.title
              : scene.route.name;

        return (
          <MyHeader
            title={title}
            leftButton={
              previous ? <MyBackButton onPress={navigation.goBack} /> : undefined
            }
            style={options.headerStyle}
          />
        );
      },
    },
    Page1Detail2: Page1DetailScreen2,
    Page1Spinner,
  },
  {
    initialRouteName: 'Page1Home',
    //initialRouteName: 'Page1Spinner',
    
    unmountInactiveRoutes: true,
    
    getCustomActionCreators: (route, stateKey, props, navigation) => {
      console.log("Page1Screen_Main.js MainStack getCustomActionCreators() --------------------------");
      console.log("route:" + route + " stateKey:" + stateKey + " props:" + props + " navigation:" + navigation);
      console.log(route);
      console.log(this);
      if ( stateKey === null ){
        return null;
      }
      if (route.useIsDrawerOpen){
      } else {
        DrawerActions.openDrawer();
        console.log("DrawerActions.openDrawer()");
      }

      return {
      };

    },

    // 以下はここでは呼ばれないもの
    componentWillUnmount: () => {
      console.log("Page1Screen_Main.js componentWillUnmount ");
    },
    componentDidMount: () => {
      console.log("Page1Screen_Main.js app componentDidMount ");
    },
    navigationOptions: ( navigation ) => {
      console.log("Page1Screen_Main.js navigationOptions() ");
    },
  }
);

MainStack.onStateChange = ({ newState }) => {
  console.log("Page1Screen_Main.js onStateChange ");
}

LeftDrawer1.navigationOptions = ({  route, navigation }) => {
  console.log("Page1Screen_Main.js LeftDrawer1.navigationOptions ----------------------------------------");
  console.log(route);
  console.log(navigation);
};

Page1ScreenJS.navigationOptions = ({ route, navigation }) => {
  console.log("Page1Screen_Main.js Page1ScreenJS.navigationOptions ----------------------------------------");
  console.log(route);
  console.log(navigation);
};

CustomSidebarMenu.navigationOptions = ({ route, navigation }) => {
  console.log("Page1Screen_Main.js CustomSidebarMenu.navigationOptions ----------------------------------------");
  console.log(route);
  console.log(navigation);
  hideNavigationBar();
};

export default MainStack;
