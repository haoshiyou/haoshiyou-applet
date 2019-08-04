//index.js
//获取应用实例
const app = getApp()
const hsyApiUrlBase =`https://haoshiyou-server-prod.herokuapp.com/api/HsyListings`;
const listingLimit = 24;
Page({
  data: {
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    pageNumber: 0,
    winWidth: 0,
    winHeight: 0,
    activeGroupId: null,
    groups: {},
    // Data strcture for groups:
    // {
    //   'id': {
    //     'name': '...',
    //     'rect': ...,
    //     'listings': [],
    //   }
    // }
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    console.log(app.globalData.userInfo);
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
    var groups = {};
    for (var key in app.globalData.groups) {
      var content = {
        'name': app.globalData.groups[key],
        'rect': null,
        'listings': [],
      };
      groups[key] = content;
    }
    that.setData({
      groups: groups,
    });
    if (app.globalData.userInfo) {
      that.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        that.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          that.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    this.getAllListing();
  },
  onListingClicked: function(event) {
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
        result = '' + parseInt(monthC) + '月前';
      else {
        result = '' + parseInt(monthC / 12) + '年前';
      }
    }
    else if (weekC >= 1) {
      result = '' + parseInt(weekC) + '周前';
    }
    else if (dayC >= 1) {
      result = '' + parseInt(dayC) + '天前';
    }
    else if (hourC >= 1) {
      result = '' + parseInt(hourC) + '小时前';
    }
    else if (minC >= 1) {
      result = '' + parseInt(minC) + '分钟前';
    } else {
      result = '刚刚';
    }
    return result;
  },
  onReachBottom: function () {
    var that = this;
    var NewPageNumber = that.data.pageNumber + 1;
    that.setData({
      pageNumber: NewPageNumber
    })
    that.getAllListing();
  },
  getAllListing: function (e) {
    var that = this;
    wx.request({
      url: hsyApiUrlBase,
      header: {
        'Content-Type': 'application/json',
      },
      data: {
        'filter': {
          'where': {
            'price': {
              'lt': 5000
            }
          },
          'order': 'latestUpdatedOrBump DESC',
          'limit': listingLimit,
          'offset': listingLimit * that.data.pageNumber,
          'include': ['interactions', 'owner']
        }
      },
      success: res => {
        console.log(`getAllListing requested HSY api, res = `);
        var groups = that.data.groups;
        for (let i = 0; i < res.data.length; ++i) {
          res.data[i]['timeSinceModified'] = that.getTimeSinceModified(res.data[i].lastUpdated);
          let groupId = res.data[i].hsyGroupEnum;
          groups[groupId].listings.push(res.data[i]);
          groups['All'].listings.push(res.data[i]);
        }
        that.setData({
          groups: groups,
        });
        console.log(res);
      }
    });
  },
  onTabChanged(e) {
    var id = e.detail.currentItemId;
    this.setActiveTab(id);
  },
  onTabClicked(e) {
    var id = e.target.id;
    this.setActiveTab(id);
  },
  setActiveTab: function(id) {
    var group = this.data.groups[id];
    var rect = group['rect'];
    if (rect) {
      this.animation.width(rect.width).translate(rect.left, 0);
      this.setData({
        activeGroupId: id,
        indicatorAnim: this.animation.step().export()
      })
    }
  },
  onReady: function() {
    var query = wx.createSelectorQuery().in(this),
    that = this;
    that.animation = wx.createAnimation();
    var ids = Object.keys(this.data.groups);
    for (let i = 0; i < ids.length; i++) {
      var id = ids[i];
      query.select('#'+id).boundingClientRect(function (rect) {
        let id = ids[i];
        let groups = that.data.groups;
        let group = groups[id];
        group.rect = rect;
        groups[id] = group;
        that.setData({
          groups: groups
        });
        if (id == 'All') {
          that.setActiveTab(id);
        }
      })
    }
    query.exec();
  },
})
