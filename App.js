// -*- coding: utf-8-unix -*-
// 全体のトップ画面
import React, { Component } from 'react';
import { createAppContainer } from 'react-navigation';
import { createDrawerNavigator, DrawerActions } from 'react-navigation-drawer';
import { createStackNavigator } from 'react-navigation-stack';
import { createBottomTabNavigator, createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

import Page1Screen from './screens/Page1Screen';
import Page1DetailScreen from './screens/Page1DetailScreen';
import Page2Screen from './screens/Page2Screen';
import Single1 from './screens/Single1';
import Single2 from './screens/Single2';

////////////////////////////////////////////////////////////////////////////////
// 左Drawer
const LeftDrawer1 = createDrawerNavigator(
    {
//        Home: TabNavigator,
        Home: Page1Screen,
        PageOne: Single1,
        PageTwo: Single2,
    },
    {
        initialRouteName: 'Home',
        contentOptions: {
            activeTintColor: '#e91e63',
        },
//        contentComponent: Single1,
//        drawerPosition: 'left',
        getCustomActionCreators: (route, stateKey) => {
            console.log("LeftDrawer1 cac key:" + stateKey);
//            return {
//                toggleLeftDrawer: () => DrawerActions.toggleDrawer({ key: stateKey }),
//            };
        },
        navigationOptions: ( navigation ) => {
//            let { index } = navigation.state;
//            let { routeName } = navigation.state.routes[index];

            console.log("LeftDrawer1 nO ");
        },
        drawerWidth: 200,
//        backBehavior: initialRoute,
    }
);

////////////////////////////////////////////////////////////////////////////////
// setting main nav
const MainStack = createStackNavigator(
    {
        Page1: {
            screen: LeftDrawer1,
//            screen: TabNavigator,
            navigationOptions: ({ navigation }) => ({
                title: 'ホーム',
                headerLeft: (
                        <Icon name="bars"
                    size={24}
//                    onPress={ this.LeftDrawer1.openDrawer() }
//                    onPress={() => navigation.toggleLeftDrawer()}
                    onPress={() => navigation.toggleDrawer()}
//                    onPress={() => navigation.openDrawer()}
                    style={{ paddingLeft: 20 }}
                        />
                )
            }),
        },
        Page1Detail: Page1DetailScreen,
//        Page1Sub1: PageOne,
//        Page1Sub2: PageTwo,
    },
    {
        navigationOptions: ( navigation ) => {
            const { index } = navigation.state;
            const { routeName } = navigation.state.routes[index];

            console.log("MainStack no idx:" + index + " name:" + routeName);
        },
//        headerMode : screen,
        initialRouteName: 'Page1',
        getCustomActionCreators: (route, stateKey) => {
            if ( stateKey === null ){
                return;
            }

            console.log("MainStack cac route.key" + route.key + " stateKey:" + stateKey);

            //const navigation = useNavigation();

//            const { index } = this.props.navigation.state;
//            const { routeName } = this.props.navigation.state.routes[index];

//            console.log("idx:" + index + " name:" + routeName);

            return {
                
            };
        },
    }
);

////////////////////////////////////////////////////////////////////////////////
// tab nav setting
//const TabNavigator = createBottomTabNavigator(
const TabNavigator = createMaterialTopTabNavigator(
//const TabNavigator = createMaterialBottomTabNavigator(
    {
//        Page1: { screen: LeftDrawer1},
        Page1: MainStack,
        // createBottomTabNavigatorでヘッダーUIを表示する方法
        // https://www.aizulab.com/blog/react-navigation-createbottomtabnavigator-header-ui/
        // Page1: { screen: createStackNavigator(
        //     {
        //         Home: {
        //             screen: Page1Screen,
        //             navigationOptions: ({ navigation }) => ({
        //                 title: 'ホーム',
        //                 headerLeft: (
        //                             <Icon name="bars"
        //                         size={24}
        //                         onPress={() => navigation.toggleLeftDrawer()}
        //                         style={{ paddingLeft: 20 }}
        //                             />
        //                 )
        //             }),
        //         }
        //     },
        // ),},
        Page2: { screen: Page2Screen,
                 navigationOptions: {
                     title: 'All CHALLENGES',
//                     fontFamily: Fonts.medium,
                     header: null,
                 },
               },
    },
    {
//        tabBarOptions: {bottomTabBarOptions},
//        tabBarPosition: BottomTabBarOptions,
        tabBarPosition: 'bottom',
        initialRouteName: 'Page1',
        getCustomActionCreators: (route, stateKey) => {
            console.log("TabNavigator key:" + stateKey);
//            return {
////                toggleLeftDrawer_if: (navigation) => navigation.toggleLeftDrawer_low(),
//                toggleLeftDrawer_if: (navigation) => {},
//            }
        },
    }
);

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

//const AppContainer = createAppContainer(LeftDrawer1)
const AppContainer = createAppContainer(TabNavigator)
//const AppContainer = createAppContainer(MainStack);

export default class App extends Component {

    render() {
        const { navigation } = this.props;
        //const { routeName } = navigation.state.routes[index];

        return (
                <AppContainer />
        )
    }
};
