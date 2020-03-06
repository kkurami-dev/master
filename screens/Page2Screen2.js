import React, { Component } from 'react';
import {
  Text,View,Button
} from 'react-native';

export default class Page1Screen extends Component {
  render() {
    return (
      <View>
        <Text>Page2Screen2</Text>
        <Button
          title="go to Home"
          onPress={() => {
            this.props.navigation.navigate('TabPage1')
          }}
        />
      </View>
    )
  }
}
