import React, { Component } from 'react';
import {
  Text,View,Button
} from 'react-native';

export default class Page1Screen extends Component {
  render() {
    return (
      <View>
        <Text>Page1</Text>
        <Button
          title="go to Detail"
          onPress={() => {
            this.props.navigation.navigate('Page1Detail')
          }}
        />
      </View>
    )
  }
}
