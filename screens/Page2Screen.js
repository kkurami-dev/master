import React, { Component } from 'react';
import { createStackNavigator } from 'react-navigation-stack';

import Page2Screen1 from './Page2Screen1';
import Page2Screen2 from './Page2Screen2';


export default createStackNavigator(
    {
        Page1: Page2Screen1,
        Page2: Page2Screen2,
        
    }
)
