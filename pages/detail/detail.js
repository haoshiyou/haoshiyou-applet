Page({
  data: {
    listing: {},
  },
  onLoad: function (options) {
    this.setData({
      listing: JSON.parse(decodeURIComponent(options.listing))
    });
  },
})