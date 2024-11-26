Page({
  data: {
    banners: [],
    news: []
  },

  onLoad: function() {
    this.fetchData();
  },

  fetchData: function() {
    var that = this;
    wx.request({
      url: 'https://boomspace.acornyun.com/api/get_images',  // 根据实际部署的后端URL修改
      method: 'GET',
      success: function(res) {
        if (res.statusCode === 200) {
          that.setData({
            banners: res.data.images,
            news: res.data.news
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
