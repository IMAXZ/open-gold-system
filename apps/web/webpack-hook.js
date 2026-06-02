// Webpack 插件，用于在构建完成后执行自定义逻辑

class WebpackPluginHook {
  constructor(callback) {
    this.callback = callback
  }

  apply(compiler) {
    compiler.hooks.done.tap('WebpackPluginHook', (stats) => {
      // 构建完成后调用回调
      this.callback({
        outputOptions: compiler.options.output,
        compilation: stats.compilation
      })
    })
  }
}

module.exports = { WebpackPluginHook }
