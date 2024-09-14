module.exports = {
  configureWebpack: {
    resolve: {
      fallback: {
        fs: false,
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser")
      }
    }
  }
}
