Page({
  data: {
    userInfo: {},
    genders: ['请选择', 'Male', 'Female', 'Other'],
    birthDate: '',
    todayDate: new Date().toISOString().slice(0, 10)
  },
  onLoad: function() {
    this.fetchUserInfo();

  },
  fetchUserInfo: function() {
    var that = this;
    wx.request({
      url: 'https://boomspace.acornyun.com/api/view_user_info',
      method: 'GET',
      header: {
        'Authorization': 'Token ' + wx.getStorageSync('token'),
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode === 200) {
          let data = res.data;
          let genderIndex = that.data.genders.indexOf(data.gender) !== -1 ? that.data.genders.indexOf(data.gender) : 0;
          that.setData({
            userInfo: { ...data, genderIndex }
          });
        }
      }
    });
  },

  onBirthDateChange: function(e) {
    this.setData({
      birthDate: e.detail.value
    });
  },

  validateEmail: function(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },

  validatePhone: function(phone) {
    var re = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
    return re.test(phone);
  },

  submitForm: function(e) {
    const formData = e.detail.value;
    if (!this.validateEmail(formData.email)) {
      wx.showToast({
        title: '无效的邮箱地址',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    if (!this.validatePhone(formData.phone)) {
      wx.showToast({
        title: '无效的手机号码',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    formData.birthDate = this.data.birthDate;
    formData.gender = this.data.genders[formData.genderIndex];
    wx.request({
      url: 'https://boomspace.acornyun.com/api/update_user_info/',
      method: 'POST',
      header: {
        'Authorization': 'Token ' + wx.getStorageSync('token'),
        'content-type': 'application/json'
      },
      data: formData,
      success: function(res) {
        if (res.data.message) {
          wx.showToast({
            title: '更新成功',
            icon: 'success',
            duration: 2000
          });
          console.log("上传成功 "+res.data.message)
        }
      },
      fail: function() {
        wx.showToast({
          title: '更新失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});
