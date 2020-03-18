import React, { Component } from 'react';
import {
  Text,View,Button
} from 'react-native';

export default class Page1Screen extends Component {
  render() {
    console.log("Page2Screen1.js render ----------------------------------------");
    console.log(this);
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
