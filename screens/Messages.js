'use strict'

import React, { PureComponent } from 'react'
import {
  View,
  FlatList,
  StyleSheet
} from 'react-native'

import {
  NoPermissionToVisit,
  MessageItem,
  ItemSeparatorComponent,
  CustomButton
} from '../components'

export default class Messages extends PureComponent {
  constructor (props) {
    super(props)

    /* 
      messages: array <
        object <
          _id: string,
          type: enum(0, 1), // 0 是管理员消息，1 是同伴消息
          userId: string, // 如果是管理员消息不返回
          avatar: string, // 如果是管理员不返回，由前端设置默认头像
          nickname: string, // 如果是管理员消息不返回，由前端设置默认 nickname
          date: string, // 消息发布的时间，格式：2013-11-04
          content: string, // 消息正文，如果是同伴消息返回“您收到同伴储蓄情况反馈，点击查看”,
          read: boolean // 消息状态，true 为已读，false 为未读。
        > * n
    	>
    */
    this.state = {
      refreshing: false,
      startNum: 0,
      messages: []
    }
  }

  componentDidMount () {
    this.props.screenProps.hasPassedTheExam === true && this.refresh()
  }

  render () {
    return (
      <View style={{
        flex: 1,
        justifyContent: this.props.screenProps.hasPassedTheExam === false ? 'center' : 'flex-start',
        backgroundColor: this.$screenBackgroundColor
      }}>
        {
          this.props.screenProps.hasPassedTheExam === false ? 
          <NoPermissionToVisit
            navigate={this.props.navigation.navigate}
          /> :
          <FlatList
            data={this.state.messages}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <MessageItem
                type={item.type}
                avatar={item.type === 1 ? item.avatar : undefined}
                nickname={item.type === 1 ? item.nickname : undefined}
                date={item.date}
                content={item.content}
                read={item.read}
                onPress={async () => {
                  if (item.read === false) {
                    await this.readMessage(item._id)
                  }

                  if (item.type === 0) {
                    this.props.navigation.navigate('SystemNotification', {
                      title: this.$i18n.t('messages.systemNotification'),
                      content: item.content,
                      date: item.date
                    })
                  } else if (item.type === 1) {
                    this.props.navigation.navigate('SavingsSituations', {
                      title: item.nickname,
                      userId: item.userId
                    })
                  }
                }}
              />
            )}
            ItemSeparatorComponent={ItemSeparatorComponent}
            ListFooterComponent={this.state.messages.length !== 0 ? () => (
              <View style={{
                paddingTop: this.$verticalSpacingDistance,
                paddingBottom: this.$verticalSpacingDistance,
                paddingLeft: this.$horizontalSpacingDistance,
                paddingRight: this.$horizontalSpacingDistance
              }}>
                  <CustomButton
                    onPress={() => this.getMessages()}
                    text={this.$i18n.t('peerSavingsSituations.loadMore')}
                  />
              </View>
            ) : undefined}
            refreshing={this.state.refreshing}
            onRefresh={this.props.screenProps.hasPassedTheExam === true ? () => this.refresh() : undefined}
          />
        }
      </View>
    )
  }

  async getMessages () {
    const response = (await this.$JSONAjax({
      method: 'post',
      url: '/message/getMessages',
      data: {
        startNum: this.state.startNum * 20,
        pageSize: 20
      }
    })).data

    if (response.statusCode === 100 && response.result.messages.length !== 0) {
      this.setState((prevState, props) => ({
        startNum: prevState.startNum + 1,
        messages: prevState.messages.concat(response.result.messages)
      }))

      this.props.screenProps.checkHasNewMessages()
    }
  }

  refresh () {
    this.setState({
      refreshing: true,
      startNum: 0,
      messages: []
    }, async () => {
      await this.getMessages()
      this.setState({ refreshing: false })
    })
  }

  async readMessage (_id) {
    const response = (await this.$JSONAjax({
      method: 'post',
      url: '/message/readMessage',
      data: {
        _id
      }
    })).data

    if (response.statusCode === 100) {
      this.refresh()
    }
  }
}

const styles = StyleSheet.create({
  messages: {
    flex: 1
  }
})
