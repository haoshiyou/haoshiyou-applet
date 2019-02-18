//index.js
//获取应用实例
const app = getApp()
const hsyApiUrlBase =`https://haoshiyou-server-prod.herokuapp.com/api/HsyListings`;
Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasListingInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    allListing: []
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log(app.globalData.userInfo)
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.getAllListing()
  },
  onClick: function(event) {
    var listing = encodeURIComponent(JSON.stringify((event.currentTarget.dataset.listing)));
    wx.navigateTo({
      url: '../detail/detail?listing=' + listing
    });
  },
  getUserInfo: function(e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  getTimeSinceModified: function(timeStamp) {
    var result;
    var minute = 1000 * 60;
    var hour = minute * 60;
    var day = hour * 24;
    var halfamonth = day * 15;
    var month = day * 30;
    var now = new Date().getTime();
    var diffValue = now - new Date(timeStamp).getTime();
    if (diffValue < 0) {
      return;
    }
    var monthC = diffValue / month;
    var weekC = diffValue / (7 * day);
    var dayC = diffValue / day;
    var hourC = diffValue / hour;
    var minC = diffValue / minute;
    if (monthC >= 1) {
      if (monthC <= 12)
        result = "" + parseInt(monthC) + "月前";
      else {
        result = "" + parseInt(monthC / 12) + "年前";
      }
    }
    else if (weekC >= 1) {
      result = "" + parseInt(weekC) + "周前";
    }
    else if (dayC >= 1) {
      result = "" + parseInt(dayC) + "天前";
    }
    else if (hourC >= 1) {
      result = "" + parseInt(hourC) + "小时前";
    }
    else if (minC >= 1) {
      result = "" + parseInt(minC) + "分钟前";
    } else {
      result = "刚刚";
    }
    return result;
  },
  getAllListing: function (e) {
    wx.request({
      url: hsyApiUrlBase,
      header: {
        "Content-Type": "application/json",
      },
      data: {
        "filter": 
          {"where": {
            "price": {
              "lt": 5000 
            }
          },
          "order": "latestUpdatedOrBump DESC",
          "limit": 24,
          "offset": 0,
          "include": ["interactions", "owner"]
        }
      },
      success: res => {
        console.log(`getAllListing requested HSY api, res = `);
        for (let i = 0; i < res.data.length; ++i) {
          res.data[i]['timeSinceModified'] = this.getTimeSinceModified(res.data[i].lastUpdated)
        } 
        this.setData({
          allListing: res.data
        })
        console.log(res);
      }
    });
  }
})
