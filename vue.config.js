module.exports = { //多页面打包
  publicPath: './',
  pages: {
    main: {
      // page 的入口
      entry: 'src/modules/main/main.js',
      // 模板来源
      template: 'public/main.html',
      // 在 dist/index.html 的输出
      filename: 'main.html',
      // 当使用 title 选项时，
      // template 中的 title 标签需要是 <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'Main Page'
    },
    remind: {
      entry: 'src/modules/remind/remind.js',
      template: 'public/remind.html',
      filename: 'remind.html',
      title: 'Remind Page'
    }
  },
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        // options placed here will be merged with default configuration and passed to electron-builder
        "appId": "this.is.tasky",
        "productName": "Tiger ToDo",
        "copyright": "Copyright © 2021 Tiger",
        "publish": ['github'], //发布到github
        "directories": {
          "buildResources": "build"
        },
        "mac": {
          "category": "public.app-category.utilities"
        },
        "dmg": {
          "background": "build/background.jfif",
          "icon": "build/icons/icon.icns",
          "iconSize": 100,
          "contents": [
            {
              "x": 380,
              "y": 180,
              "type": "link",
              "path": "/Applications"
            },
            {
              "x": 130,
              "y": 180,
              "type": "file"
            }
          ],
          "window": {
            "width": 540,
            "height": 380
          }
        },
        "win": {
          "target": [
            "msi",
            "nsis"
          ],
          "icon": "build/icons/icon.ico"
        },
        "nsis": {
          "oneClick": false,
          "language": "2052",
          "perMachine": true,
          "allowToChangeInstallationDirectory": true
        }
      }
    }
  }
}
