// reservation.js
Page({
  data: {
    courtTypes: [],
    courtTypeIndex: 0,
    selectedCourtType: "",
    availableTimes: [],
    timeIndex: 0,
    selectedTime: "",
    price: "",
    timeslotDetails: {}, // 存放每个场地的时间段详细信息
    isCombo: false, // 是否为组合场地
    comboCourts: [] // 组合场地包含的场地列表
  },

  onLoad: function(options) {
    this.loadInitialData();
  },

  loadInitialData: function() {
    var that = this;
    wx.request({
      url: 'https://boomspace.acornyun.com/api/available_timeslots',
      method: 'GET',
      header: {
        'Authorization': 'Token ' + wx.getStorageSync('token'),
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.statusCode === 200) {
          let courts = new Set();
          let times = {};
          
          res.data.available_timeslots.forEach(slot => {
            courts.add(slot.court_name);
            const timeStr = `${slot.start_time}-${slot.end_time} (${slot.date})`;
            
            if (!times[slot.court_name]) {
              times[slot.court_name] = [];
            }
            
            // 存储完整的时间段信息，包括combo相关字段
            const timeSlotInfo = {
              timeStr: timeStr,
              price: slot.price,
              date: slot.date,
              startTime: slot.start_time,
              isCombo: slot.is_combo,
              comboCourts: slot.combo_courts,
              // 根据是否为combo存储不同的ID
              ...(slot.is_combo 
                ? { 
                    timeslotIds: slot.timeslot_ids,
                    comboId: slot.combo_id
                  }
                : { 
                    timeslotId: slot.timeslot_id 
                  }
              )
            };
            
            times[slot.court_name].push(timeSlotInfo);
            
            // 排序每个场地的时间
            times[slot.court_name].sort((a, b) => 
              new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`)
            );
          });

          that.setData({
            courtTypes: Array.from(courts),
            timeslotDetails: times,
            selectedCourtType: Array.from(courts)[0],
          });
          that.updateCourtSelection();
        }
      }
    });
  },

  onCourtTypeChange: function(e) {
    const index = e.detail.value;
    this.setData({
      courtTypeIndex: index,
      selectedCourtType: this.data.courtTypes[index]
    });
    this.updateCourtSelection();
  },

  updateCourtSelection: function() {
    const selectedDetails = this.data.timeslotDetails[this.data.selectedCourtType];
    const filteredTimes = selectedDetails.map(detail => {
      let priceText = `$${detail.price}`;
      if (detail.isCombo) {
        priceText += ' (组合)';
      }
      return `${detail.timeStr} - ${priceText}`;
    });

    const firstSlot = selectedDetails[0] || {};
    this.setData({
      availableTimes: filteredTimes,
      selectedTime: filteredTimes[0] || "",
      price: firstSlot.price || "",
      isCombo: firstSlot.isCombo || false,
      comboCourts: firstSlot.comboCourts || []
    });
  },

  onTimeChange: function(e) {
    const index = e.detail.value;
    const selectedSlot = this.data.timeslotDetails[this.data.selectedCourtType][index];
    this.setData({
      timeIndex: index,
      selectedTime: this.data.availableTimes[index],
      price: selectedSlot.price,
      isCombo: selectedSlot.isCombo,
      comboCourts: selectedSlot.comboCourts || []
    });
  },

  confirmReservation: function() {
    const details = this.data.timeslotDetails[this.data.selectedCourtType][this.data.timeIndex];
    const url = details.isCombo 
      ? 'https://boomspace.acornyun.com/api/make_combo_reservation'
      : 'https://boomspace.acornyun.com/api/make_reservation';
    
    // 根据是否为combo准备不同的请求数据
    const requestData = details.isCombo
      ? {
          timeslot_ids: details.timeslotIds,
          date: details.date,
          combo_id: details.comboId
        }
      : {
          timeslot_id: details.timeslotId,
          date: details.date
        };

    wx.request({
      url: url,
      method: 'POST',
      header: {
        'Authorization': 'Token ' + wx.getStorageSync('token'),
        'content-type': 'application/json'
      },
      data: requestData,
      success: function(res) {
        if (res.data.status === 'success') {
          wx.showToast({
            title: '预约成功',
            icon: 'success',
            duration: 2000
          });
          // 可以添加预约成功后的逻辑，比如跳转到订单页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/my_reservation/my_reservation'  // 跳转到订单页面
            });
          }, 2000);
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function(error) {
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});