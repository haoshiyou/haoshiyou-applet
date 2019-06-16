Page({
  data: {
    listing: {},
    imageURLs: {},
  },
  onLoad: function (options) {
    this.setData({
      listing: JSON.parse(decodeURIComponent(options.listing))
    });
    var baseURL = 'http://res.cloudinary.com/xinbenlv/image/upload/c_fill,g_north,w_750,h_450,g_center/';
    var urls = [];
    for (let i = 0; i < this.data.listing.imageIds.length; ++i) {
      urls.push(baseURL + this.data.listing.imageIds[i] + '.jpg');
    }
    this.setData({
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