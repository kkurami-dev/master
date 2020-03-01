import React from "react";
import { AppRegistory, Image, StatusBar } from "react-native";
import { Container, Content, Text, List, ListItem } from "native-base";
const routes = ["Home", "PageOne", "PageTwo"];
export default class SideBar extends React.Component {
  render() {
    return (
      <Container>
        <Content>
          <Image
              source={{
                uri: "https://tech.windii.jp/wp-content/uploads/2018/07/react-native.png"
              }}
              style={{
                height: 120,
                alignSelf: "stretch",
                justifyContent: "center",
                alignItems: "center"
              }}
            />
          <List
            dataArray={routes}
            renderRow={data => {
              return (
                <ListItem
                  button
                  onPress={() => this.props.navigation.navigate(data)}
                >
                  <Text>{data}</Text>
                </ListItem>
              )
            }}
          />
        </Content>
      </Container>
    )
  }
}
