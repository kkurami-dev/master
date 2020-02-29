// -*- coding: utf-8-unix -*-
// 全体のトップ画面
import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator } from 'react-navigation-tabs';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';

import Page1Screen from './screens/Page1Screen';
import Page1DetailScreen from './screens/Page1DetailScreen';
import Page2Screen from './screens/Page2Screen';
import Single1 from './screens/Single1';
import Single2 from './screens/Single2';

// tab nav setting
//const TabNavigator = createBottomTabNavigator(
const TabNavigator = createMaterialBottomTabNavigator(
    {
        Page1: { screen: createStackNavigator(
            {
                Home: {
                    screen: Page1Screen,
                    navigationOptions: {
                        title: 'ホーム',
                        headerLeft: (
                                    <Icon name="bars"
                                size={24}
//                                onPress={() => navigation.toggleLeftDrawer()}
                                style={{ paddingLeft: 20 }}
                                    />
                        )
                    },
                }
            },
        ),},
        Page2: Page2Screen
    },
    {
        initialRouteName: 'Page1'
    }
);

// 左Drawer
const LeftDrawer1 = createDrawerNavigator(
    {
        Home: TabNavigator,
        Drafts1: Single1,
        Drafts2: Single2,
    },
    {
        initialRouteName: 'Home',
        contentOptions: {
            activeTintColor: '#e91e63',
        },
//        contentComponent: Single1,
//        drawerPosition: 'left',
        getCustomActionCreators: (route, stateKey) => {
            // console.log("LEFT" + stateKey);
            return {
                toggleLeftDrawer: () => DrawerActions.toggleDrawer({ key: stateKey }),
            };
        },
    }
);

// setting main nav
const MainStack = createStackNavigator(
    {
        Page1: LeftDrawer1,
        Page1Detail: Page1DetailScreen,
    },
    {
//        headerMode : screen,
        initialRouteName: 'Page1',
    }
)

const AppContainer = createAppContainer(LeftDrawer1)

export default class App extends Component {

    render() {
        return (
                <AppContainer />
        )
    }
}
