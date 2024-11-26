const app = getApp();

Page({
  data: {
    reservations: [],
    wallet_balance: 0,
    loading: true
  },

  onLoad: function() {
    this.loadReservations();
  },

  onPullDownRefresh: function() {
    this.loadReservations();
  },

  formatDateString: function(dateStr) {
    if (!dateStr) return 0;
    return new Date(dateStr.replace(' ', 'T')).getTime();
  },

  loadReservations: function() {
    this.setData({ loading: true });
    
    wx.request({
      url: 'https://boomspace.acornyun.com/api/view_reservations_and_balance',
      method: 'GET',
      header: {
        'Authorization': 'Token ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode === 200) {
          // 处理预约状态的显示文本
          const reservations = res.data.reservations.map(reservation => ({
            ...reservation,
            status: this.formatStatus(reservation.status)
          }));

          // 按创建时间从新到旧排序
          reservations.sort((a, b) => this.formatDateString(b.created_at) - this.formatDateString(a.created_at));

          this.setData({
            reservations,
            wallet_balance: Number(res.data.wallet_balance).toFixed(2)
          });
        } else {
          wx.showToast({
            title: '获取数据失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        this.setData({ loading: false });
        wx.stopPullDownRefresh();
      }
    });
  },

  formatStatus: function(status) {
    const statusMap = {
      'pending': '待确认',
      'confirmed': '已确认',
      'cancelled': '已取消'
    };
    return statusMap[status] || status;
  },

  handleRecharge: function() {
    wx.showModal({
      title: '提示',
      content: '钱包充值请先进入我的账户完善用户信息，然后联系客服进行充值',
      showCancel: false
    });
  },

  goToReservation: function() {
    wx.navigateTo({
      url: '/pages/reservation/reservation'
    });
  }
});