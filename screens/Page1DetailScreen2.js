import React, { Component } from 'react';
import {
  Text,
  View,
  Button
} from 'react-native';
import { CommonActions  } from '@react-navigation/native';

export default class Page1ScreenDetail2 extends Component {
  state = {
    currentColor: this.props.defaultColor,
    palette: 'rgb',
    externalData: null,
  };

  componentDidUpdate(prevProps) {
    console.log("0301 componentDidUpdate");
    if (this.props.userID !== prevProps.userID) {
      this.fetchData(this.props.userID);
    }
  }

  static getDerivedStateFromProps(props, state) {
    // ...
    console.log("0302 getDerivedStateFromProps");
    return null;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    // ...
    console.log("0303 getSnapshotBeforeUpdate");
    return null;
  }

  render() {
    return (
      <View>
        <Text>Page1DetaiScreen2</Text>
        <Button
          title="go to Detail"
          onPress={( ) => {
            this.props.navigation.navigate('Page1Home');
            this.props.navigation.navigate('TabPage2');
          }}
        />
        <View style={{ height: 20  }} />
        <Button
          title="go home 1"
          onPress={() => {
            this.props.navigation.reset({
              index: 0,
              routes: [{ name: 'Page1Home' }],
            });
          }}
        />
        <View style={{ height: 20  }} />
        <Button
          title="go home 2"
          onPress={({navigation, route }) =>
                   this.props.navigation.reset({
                     index: 0,
                     routes: [
                       {
                         name: 'Page1Home',
                         params: { user: 'jane', key: route.params.key },
                       },
                       {
                         name: 'Home'
                       },
                     ],
                   })
                  }
        />
      </View>
    )
  }
}
