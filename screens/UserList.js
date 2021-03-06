'use strict'

import React, { PureComponent } from 'react'

import {
  View,
  FlatList
} from 'react-native'

import {
  ListItem,
  ItemSeparatorComponent,
  CustomButton
} from '../components'

export default class UserList extends PureComponent {
  constructor (props) {
    super(props)

    /*
      users: array <
        object <
          _id: string,
          avatar: string,
          nickname: string
        >
      >
    */
    this.state = {
      refreshing: false,
      startNum: 0,
      users: [] 
    }
  }

  componentDidMount () {
    this.refresh()
  }

  render () {
    return (
      <View style={{
        flex: 1,
        backgroundColor: this.$screenBackgroundColor
      }}>
        <FlatList
          data={this.state.users}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ListItem
              onPress={() => this.props.navigation.navigate('SavingsSituations', {
                title: item.nickname,
                userId: item._id
              })}
              itemIcon={item.avatar}
              iconSize={36}
              marginRight={112}
              itemKey={item.nickname}
            />
          )}
          ItemSeparatorComponent={ItemSeparatorComponent}
          ListFooterComponent={this.state.users.length !== 0 ? () => (
            <View style={{
              paddingTop: this.$verticalSpacingDistance,
              paddingBottom: this.$verticalSpacingDistance,
              paddingLeft: this.$horizontalSpacingDistance,
              paddingRight: this.$horizontalSpacingDistance
            }}>
                <CustomButton
                  onPress={() => this.getUsers()}
                  text={this.$i18n.t('peerSavingsSituations.loadMore')}
                />
            </View>
          ) : undefined}
          refreshing={this.state.refreshing}
          onRefresh={() => this.refresh()}
        />
      </View>
    )
  }

  async getUsers () {
    const response = (await this.$JSONAjax({
      method: 'post',
      url: '/user/getUsers',
      data: {
        group: 4,
        startNum: this.state.startNum * 20,
        pageSize: 20
      }
    })).data

    if (response.statusCode === 100 && response.result.users.length !== 0) {
      this.setState((prevState, props) => ({
        startNum: prevState.startNum + 1,
        users: prevState.users.concat(response.result.users)
      }))
    }
  }

  refresh () {
    this.setState({
      refreshing: true,
      startNum: 0,
      users: []
    }, async () => {
      await this.getUsers()
      this.setState({ refreshing: false })
    })
  }
}
