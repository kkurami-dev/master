// -*- coding: utf-8-unix -*-
// 全体のトップ画面
import Storage from 'react-native-storage';
import React, { Component, useCallback, useEffect, AsyncStorage } from 'react';
import { Text, View, Button, TouchableOpacity} from 'react-native';
import { createAppContainer, DeviceEventEmitter, StackActions } from 'react-navigation';
import { createMaterialTopTabNavigator } from 'react-navigation-tabs';
import { useNavigation, useFocusEffect, CommonActions  } from '@react-navigation/native';
import { hideNavigationBar } from 'react-native-navigation-bar-color';

////////////////////////////////////////
//import styles from './screens/MyStyles';

import Page1Screen_Main from './screens/Page1Screen_Main';
import Page2Screen_Main from './screens/Page2Screen_Main';

const state = {
  nawpage: "",
  
};

////////////////////////////////////////////////////////////////////////////////
// tab nav setting
function TabScreen({navigation, e}){
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', e => {
      // Prevent default behavior
      e.preventDefault();

      alert('Default behavior prevented');
      // Do something manually
      // ...
    });

    return unsubscribe;
  }, [navigation]);
  
  return (<Page1Screen_Main />);
}

const TabNavigator = createMaterialTopTabNavigator(
  {
    TabPage1: Page1Screen_Main,
    TabPage2: Page2Screen_Main,
    //TabPage3: (navigation, e) => TabScreen,
  },
  {
    initialRouteName: 'TabPage1',
    removeClippedSubviews: true,
    tabBarPosition: 'bottom',
    getCustomActionCreators: (navigation, route, stateKey, props) => {
      //const { index } = navigation.state;
      console.log("0101 getCustomActionCreators key:" + stateKey + " param:" + props + " route:" + route);
      hideNavigationBar();
      // let { index } = navigation.state;
      // let { routeName } = navigation.state.routes[index];
      // return TabHide({ index, routeName });
    },
    style: { backgroundColor: 'powderblue' },
    defaultNavigationOptions: {
      tabBarOnPress: ({ navigation, defaultHandler }) => {
        console.log("App.js TabNavigator  tabBarOnPress");
        // to navigate to the top of stack whenever tab changes
        navigation.dispatch(StackActions.popToTop());
        defaultHandler();
      },
    },
    tabBarOptions:{
      activeTintColor: '#ffffff',
      inactiveTintColor: '#777777',
      tabStyle: {
        borderTopWidth: 2,
        borderTopColor: '#5ab4bd',
        borderWidth:1,
        borderColor:'#ccc'
      },
    },
  }
);


////////////////////////////////////////////////////////////////////////////////
//const resetAction = NavigationActions.reset({
//          index: 0,
//          actions: [NavigationActions.navigate({routeName: 'List'})],
//          key: null,
//});
//navigation.dispatch(resetAction);

function TabHide({ index, routeName }){
  let navigationOptions = {};

  //console.log("TabHide no idx:" + index + " name:" + routeName);
  if( routeName === Page1Screen_Main ){
    header : null;
  }
  if( index === 0 ){
    //console.log("TabHide tab true");
    navigationOptions.tabBarVisible = true;
  } else {
    //console.log("TabHide() tab false");
    navigationOptions.tabBarVisible = false;
  }

  return navigationOptions;
}

Page1Screen_Main.navigationOptions = ({ navigation }) => {
  const { index } = navigation.state;
  const { routeName } = navigation.state.routes[index];
  return TabHide({ index, routeName });
};
Page2Screen_Main.navigationOptions = ({ navigation }) => {
  const { index } = navigation.state;
  const { routeName } = navigation.state.routes[index];
  return TabHide({ index, routeName });
};

TabNavigator.navigationOptions = ({ navigation }) => {
  console.log("App.js TabNavigator.navigationOptions ");
  console.log(navigation);
}

function Profile({ userId }) {
  const [user, setUser] = React.useState(null);

  useFocusEffect(
    React.useCallback(() => {
      console.log("Profile() React.useCallback ");
      const unsubscribe = API.subscribe(userId, user => setUser(user));

      return () => unsubscribe();
    }, [userId])
  );

  return <ProfileContent user={user} />;
}

//const AppContainer = createAppContainer(TabScreen);
const AppContainer = createAppContainer(TabNavigator);
AppContainer.navigationOptions = ({ navigation }) => {
  console.log("App.js AppContainer.navigationOptions ----------------------------------------");
  console.log(this);
}
AppContainer.onStateChange = ({ newState }) => {
  console.log("App.js AppContainer.onStateChange ----------------------------------------");
  console.log(this);
}

export default class App extends Component {
  state = {
    data1: '999',
    text: 'テスト',
  };

  onMyStateChange = ({ newState }) => {
    console.log("App.js onStateChange ----------------------------------------");
    console.log(this);
  }

  componentWillUnmount(){
    console.log("App.js app componentWillUnmount ");
  }
  componentDidMount(props, navigation){
    console.log("App.js componentDidMount ----------------------------------------");
    console.log(navigation);
    console.log(props);
    console.log(this);
  }

  updateParentState(_text) {
    this.setState({text: _text})
  }
  
  render() {
    console.log("App.js render ----------------------------------------");
    console.log(this);
    const { navigation } = this.props;


    return (
      <AppContainer />
    )
  }
};
