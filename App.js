import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';

import Page1Screen from './screens/Page1Screen';
import Page1DetailScreen from './screens/Page1DetailScreen';
import Page2Screen from './screens/Page2Screen';
import Single1 from './screens/Single1';

// setting main nav
const MainStack = createStackNavigator(
  {
    Page1: Page1Screen,
    Page1Detail: Page1DetailScreen,
  },
  {
    initialRouteName: 'Page1'
  }
)

// 左Drawer
const LeftDrawer1 = createDrawerNavigator(
    {
        LEFT: MainStack,
    },
    {
        contentComponent: Single1,
        drawerPosition: 'left',
    }
);

// tab nav setting
const TabNavigator = createBottomTabNavigator(
  {
    Page1: {
      screen: LeftDrawer1
    },
    Page2: Page2Screen
  },
  {
    initialRouteName: 'Page1'
  }
);

const AppContainer = createAppContainer(TabNavigator)

export default class App extends Component {

  render() {
    return (
      <AppContainer />
    )
  }
}
