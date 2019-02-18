Page({
  listing: {},
  onLoad: function (options) {
    console.log(JSON.parse(decodeURIComponent(options.listing)));
    this.setData({
      listing: JSON.parse(decodeURIComponent(options.listing))
    });
  }
})