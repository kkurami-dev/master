// -*- coding: utf-8-unix -*-
import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation-stack';

import Page2Screen1 from './Page2Screen1';
import Page2Screen2 from './Page2Screen2';


export default createStackNavigator(
  {
    Page1: {
      screen: Page2Screen1,
      navigationOptions: {
        title: '詳細',
      },
    },
    Page2: {
      screen: Page2Screen2,
      navigationOptions: {
        headerShown: false,
      },
    },
  },{
    initialRouteName: 'Page1',
  }
)
