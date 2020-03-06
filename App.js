// -*- coding: utf-8-unix -*-
// 全体のトップ画面
import React, { Component, useCallback } from 'react';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import Page1Screen from './screens/Page1Screen';
import Page1DetailScreen from './screens/Page1DetailScreen';
import Page1DetailScreen2 from './screens/Page1DetailScreen2';
import Page2Screen from './screens/Page2Screen';
import Single1 from './screens/Single1';
import Single2 from './screens/Single2';

////////////////////////////////////////////////////////////////////////////////
// 左Drawer
const LeftDrawer1 = createDrawerNavigator(
    {
        DrawerHome: Page1Screen,
        DrawerPageOne: Single1,
        DrawerPageTwo: Single2,
    },
    {
        initialRouteName: 'DrawerHome',
        contentOptions: {
            activeTintColor: '#e91e63',
        },
        getCustomActionCreators: (route, stateKey) => {
            console.log("LeftDrawer1 cac key:" + stateKey);
        },
        navigationOptions: ( navigation ) => {
            console.log("LeftDrawer1 nO ");
        },
        drawerWidth: 200,
    }
);

////////////////////////////////////////////////////////////////////////////////
// setting main nav
const MainStack = createStackNavigator(
    {
        Page1Home: {
            screen: LeftDrawer1,
            navigationOptions: ({ navigation }) => ({
                title: 'ホーム',
                headerLeft: (
                        <Icon name="bars"
                    size={24}
                    onPress={() => navigation.toggleDrawer()}
                    style={{ paddingLeft: 20 }}
                        />
                )
            }),
        },
        Page1Detail: Page1DetailScreen,
        Page1Detail2: Page1DetailScreen2,
    },
    {
        navigationOptions: ( navigation ) => {
            const { index } = navigation.state;
            const { routeName } = navigation.state.routes[index];

            console.log("MainStack no idx:" + index + " name:" + routeName);
        },
        initialRouteName: 'Page1Home',
        getCustomActionCreators: (route, stateKey) => {
            if ( stateKey === null ){
                return;
            }

            console.log("MainStack cac route.key" + route.key + " stateKey:" + stateKey);
            return {
            };
        },
    }
);

////////////////////////////////////////////////////////////////////////////////
// tab nav setting
const TabNavigator = createMaterialTopTabNavigator(
    {
        TabPage1: MainStack,
        TabPage2: { screen: Page2Screen,
                 navigationOptions: {
                     title: 'All CHALLENGES',
                     header: null,
                 },
               },
    },
    {
        tabBarPosition: 'bottom',
        initialRouteName: 'TabPage1',
        getCustomActionCreators: (route, stateKey) => {
            console.log("TabNavigator key:" + stateKey);
        },
    }
);

////////////////////////////////////////////////////////////////////////////////
MainStack.navigationOptions = ({ navigation }) => {
    const { index } = navigation.state;
    const { routeName } = navigation.state.routes[index];
    let navigationOptions = {};

    console.log("no idx:" + index + " name:" + routeName);
    if( routeName === Page1Screen ){
        header : null;
    }
    if( index === 0 ){
        console.log("tab true");
        navigationOptions.tabBarVisible = true;
    } else {
        console.log("tab false");
        navigationOptions.tabBarVisible = false;
    }

    return navigationOptions;
};

function Profile({ userId }) {
  const [user, setUser] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      const unsubscribe = API.subscribe(userId, user => setUser(user));

      return () => unsubscribe();
    }, [userId])
  );

  return <ProfileContent user={user} />;
}

const AppContainer = createAppContainer(TabNavigator)
export default class App extends Component {


    render() {
        const { navigation } = this.props;
        return (
                <AppContainer />
        )
    }
};
