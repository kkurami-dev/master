import React, { Component } from 'react';
import {
  Text,
  View,
  Button
} from 'react-native';

export default class Page1Screen extends Component {
  componentDidMount() {
    console.log('P1D0 componentDidMount now!');
  }

  componentDidUpdate() {
    console.log('P1D0 componentDidUpdate now!')
  }

  componentWillUnmount() {
    console.log('P1D0 componentWillUnmount now!')
  }
  
  render() {
    return (
      <View>
        <Text>Page1DetailScreen.js</Text>
        <Button
          title="go to Detail"
          onPress={() => {
            this.props.navigation.navigate('Page1Detail2')
          }}
        />
      </View>
    )
  }
}
