import React, { Component } from 'react';
import {
  Text,View,Button
} from 'react-native';
import { StackActions } from 'react-navigation';

export default class Page2Screen2 extends Component {
  componentDidMount() {
    console.log('P2S2 componentDidMount now!');
  }

  componentDidUpdate() {
    console.log('P2S2 componentDidUpdate now!')
  }

  shouldComponentUpdate() {
    console.log('P2S2 shouldComponentUpdate now!')
    return true;
  }
  
  render() {
    return (
      <View>
        <Text>Page2Screen2</Text>
        <Button
          title="リセットしてホームに戻る1"
          onPress={( navigation ) => {
            //navigation.dispatch(StackActions.popToTop());
            //StackActions.popToTop();
            this.props.navigation.navigate('Page1');// スタックトップ(クリア)
            this.props.navigation.navigate('Page1Home'); // 戻り先
          }}
        />
        <Button
          title="リセットしてホームに戻る2"
          onPress={() => {
            this.props.navigation.reset(
              {
                index: 0,
                key: null,
                actions: [
                  this.props.navigation.navigate({ routeName: 'Page1Home'})
                ]
              }
            )
          }}
        />
      </View>
    )
  }
}
