const app = getApp()
Page({
  data: {
    listing: {},
    imageURLs: [],
    groups: {},
  },
  onLoad: function (options) {
    var listing = JSON.parse(decodeURIComponent(options.listing));
    var baseURL = 'http://res.cloudinary.com/xinbenlv/image/upload/c_fill,g_north,g_center/';
    var urls = [];
    for (let i = 0; i < listing.imageIds.length; ++i) {
      urls.push(baseURL + listing.imageIds[i] + '.jpg');
    }
    this.setData({
      listing: listing,
      groups: app.globalData.groups,
      imageURLs: urls
    });
  },
  swiperClick: function (event) {
    wx.previewImage({
      current: event.target.dataset.imageURL,
      urls: this.data.imageURLs
    })
  },
})