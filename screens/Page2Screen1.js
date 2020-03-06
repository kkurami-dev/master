import React, { Component } from 'react';
import {
  Text,View,Button
} from 'react-native';

export default class Page1Screen extends Component {
  render() {
    return (
      <View>
        <Text>Page2Screen1</Text>
        <Button
          title="go to Page2Screen2"
          onPress={() => {
            this.props.navigation.navigate('Page2')
          }}
        />
      </View>
    )
  }
}
