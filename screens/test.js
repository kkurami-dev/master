const TabNavigator = createMaterialTopTabNavigator(
  {
    StackA,
    StackB,
    StackC,
  }, {
    defaultNavigationOptions: {
      tabBarOnPress: ({ navigation, defaultHandler }) => {
        console.log("0102 tabBarOnPress");
        // to navigate to the top of stack whenever tab changes
        navigation.dispatch(StackActions.popToTop());
        defaultHandler();
      }
    },
  }
);
