// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          this.getServerToken(res.code);
        } else {
          console.log('登录失败！' + res.errMsg);
        }
      }
    });
  },
  getServerToken: function(code) {
    wx.request({
      url: 'https://boomspace.acornyun.com/api/wechat_login',
      method: 'GET',
      data: { code: code },
      success: res => {
        if (res.data.status === 'success') {
          wx.setStorageSync('token', res.data.token);
          console.log('登陆成功！Token 已保存');
          if (res.data.is_new_user) {
            // 如果是新用户，弹出欢迎窗口或进行其他处理
            this.getUserProfile()
            wx.showModal({
              title: '提示',
              content: '欢迎加入我们的预约平台！初次使用请进入我的账户完善用户信息~',
              showCancel: false
            });
          }
          else{
            wx.showModal({
              title: '提示',
              content: '登陆成功，欢迎回来！',
              showCancel: false

            })
          }
        } else {
          console.log('登录失败: ' + res.data.message);
        }
      },
      fail: error => {
        console.error('请求登录接口失败: ', error);
      }
    });
  },

  getUserProfile: function() {
    // 推荐使用 wx.getUserProfile 获取用户信息
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途
      success: (res) => {
        this.globalData.userInfo = res.userInfo;
        wx.setStorageSync('userInfo', res.userInfo);
        console.log('用户信息已更新');
      },
      fail: () => {
        console.log('用户拒绝授权');
      }
    });
  },

  getUserInfo: function() {
    // 检查是否已授权
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo;
              wx.setStorageSync('userInfo', res.userInfo);
              console.log('用户信息已更新');
              console.log(res.userInfo);
            }
          });
        } else {
          // 未授权，向用户请求授权
          wx.authorize({
            scope: 'scope.userInfo',
            success: () => {
              wx.getUserInfo({
                success: res => {
                  this.globalData.userInfo = res.userInfo;
                  wx.setStorageSync('userInfo', res.userInfo);
                  console.log('用户信息已更新');
                  console.log(res.userInfo);
                }
              });
            }
          });
        }
      }
    });
  },

  setGlobalUserInfo: function(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  globalData: {
    userInfo: null
  }
})
