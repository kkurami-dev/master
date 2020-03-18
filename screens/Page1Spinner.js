import React, { Component } from 'react';
import {
  Text,
  View,
  Button,
  Picker,
} from 'react-native';

import { mystyle } from './Common';

export default class Page1Spinner extends Component {
  constructor(props) {
    super(props);
    // Use this.setState({userTypes: data}) when data comes from 
    // firebase. 
    this.state = {
      userTypes: [
        {userType: 'admin',    userName: 'Admin User', key: '0'},
        {userType: 'employee', userName: 'Employee User', key: '1'},
        {userType: 'dev',      userName: 'Developer User', key: '2'},
      ],
      selectedUserType: '',
    };
  }

  loadUserTypes() {
    console.log(this);
    return this.state.userTypes.map((user )=> (
      <Picker.Item label={user.userName} value={user.userType} key={user.userName}/>
    ));
  }

  render() {
    console.log(this);
    return (
      <View style={ mystyle.container }>
        <Text>Page1Spinner.js</Text>
        <View style={ mystyle.button }>
          <Button
            style={ mystyle.button }
            title="go to Detail"
            onPress={() => {
              this.props.navigation.navigate('Page1Detail2')
            }}
          />
        </View>
        <View style={ mystyle.button }>
          <Button
            style={ mystyle.button }
            title="go to Picker Reset"
            onPress={() => {
              this.setState({selectedUserType: ''})
            }}
          />
        </View>
        <View>
          <Picker
            selectedValue={this.state.selectedUserType}
            onValueChange={(itemValue, itemIndex) => 
                           this.setState({selectedUserType: itemValue})}>
            // Dynamically loads Picker.Values from this.state.userTypes.
            {this.loadUserTypes()}
          </Picker>
        </View>
      </View>
    );
  }
}
