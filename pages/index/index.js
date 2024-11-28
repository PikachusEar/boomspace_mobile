Page({
  data: {
    banners: [],
    news: [],
    is_activated: false  // 默认设置为 false
  },

  onLoad: function() {
    this.fetchData();
  },

  fetchData: function() {
    var that = this;
    wx.request({
      url: 'http://localhost:8000/api/get_images',
      method: 'GET',
      success: function(res) {
        if (res.statusCode === 200) {
          // 假设使用第一张图片的 is_activated 值
          const is_activated = res.data.images.length > 0 ? res.data.images[0].is_activated : false;
          
          that.setData({
            banners: res.data.images,
            news: res.data.news,
            is_activated: is_activated  // 设置 is_activated 的值
          });
        } else {
          console.log('数据加载失败:', res);
        }
      },
      fail: function(err) {
        console.log('请求失败:', err);
      }
    });
  },

  makeReservation: function() {
    wx.navigateTo({
      url: '/pages/reservation/reservation'
    });
  },

  viewReservations: function() {
    wx.navigateTo({
      url: '/pages/my_reservation/my_reservation'
    });
  },

  rechargeWallet: function() {
    wx.navigateTo({
      url: '/pages/recharge/recharge'
    });
  },

  viewArticle: function(event) {
    const imageUrl = event.currentTarget.dataset.poster;
    wx.previewImage({
      urls: [imageUrl],
      current: imageUrl
    });
  }
});