import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import { app, BrowserWindow, ipcMain, Tray, Menu, screen } from 'electron'

const path = require('path')
const iconPath = path.join(__static, 'icon.png')//应用运行时的标题栏图标

let mainWindow
let tray
let remindWindow
//初始化窗口
app.on('ready', async () => {
  mainWindow = new BrowserWindow({
    frame: false,  //无边框窗口
    resizable: false,//不允许用户改变窗口大小
    width: 800,//设置窗口宽高
    height: 600,
    icon: iconPath,//应用运行时的标题栏图标
    webPreferences: {
      backgroundThrottling: false,//设置应用在后台正常运行
      nodeIntegration: true,//设置能在页面使用nodejs的API
      contextIsolation: false
    }
  })
  //加载主窗口页面
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await mainWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/main.html')
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    mainWindow.loadURL(`file://${__dirname}/main.html`)
  }
  mainWindow.removeMenu() //去掉菜单栏,防止通过快捷键唤起
  setTray()
})

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) createWindow()
// })
//监听主窗口关闭 IPC通信
ipcMain.on('mainWindow:close', () => {
  mainWindow.hide()
})
//监听提醒窗口关闭
ipcMain.on('remindWindow:close', () => {
  remindWindow.close()
})
//主进程-->渲染进程
ipcMain.on('setTaskTimer', (event, time, task) => {
  const now = new Date()
  const date = new Date()
  date.setHours(time.slice(0, 2), time.slice(3), 0)
  const timeout = date.getTime() - now.getTime()
  setTimeout(() => {
    createRemindWindow(task)   //到时弹框提醒
  }, timeout)
})
//设置任务栏托盘
function setTray () {
  tray = new Tray(iconPath) //实例化一个tray对象，构造函数的唯一参数是需要在托盘中显示的图标url
  tray.setToolTip('Tasky') //鼠标移到托盘中应用程序的图标上时，显示的文本
  tray.on('click', () => {   //点击图标的响应事件，这里是切换主窗口的显示和隐藏
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })
  //右键点击图标时，出现的菜单，通过Menu.buildFromTemplate定制，这里只包含退出程序的选项。
  tray.on('right-click', () => { 
    const menuConfig = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => app.quit()
      }
    ])
    tray.popUpContextMenu(menuConfig)
  })
}
/**
 * 创建提醒窗口
 * @param {*} task 
 */
function createRemindWindow (task) {
  if (remindWindow) remindWindow.close()
  //创建提醒窗口
  remindWindow = new BrowserWindow({
    height: 450,
    width: 360,
    resizable: false,
    frame: false,
    icon: iconPath,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  })
  remindWindow.removeMenu()
  //获取屏幕尺寸
  const size = screen.getPrimaryDisplay().workAreaSize
  //获取托盘位置的y坐标（windows在右下角，Mac在右上角）
  const { y } = tray.getBounds()
  //获取窗口的宽高
  const { height, width } = remindWindow.getBounds()
  //计算窗口的y坐标
  const yPosition = process.platform === 'darwin' ? y : y - height
  //setBounds设置窗口的位置
  remindWindow.setBounds({
    x: size.width - width,//x坐标为屏幕宽度 - 窗口宽度
    y: yPosition,
    height,
    width
  })
  //当有多个应用时，提醒窗口始终处于最上层
  remindWindow.setAlwaysOnTop(true)
  //加载提醒页面
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    remindWindow.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '/remind.html')
  } else {
    createProtocol('app')
    remindWindow.loadURL(`file://${__dirname}/remind.html`)
  }
  //传值给提醒页面(主进程发送消息给渲染进程)
  remindWindow.webContents.on('did-finish-load', () => {
    remindWindow.webContents.send('setTask', task)
  })
  //显示提醒页面
  remindWindow.show()
  //关闭回收渲染进程的资源
  remindWindow.on('closed', () => { remindWindow = null })
  setTimeout(() => {
    remindWindow && remindWindow.close()
  }, 50 * 1000)
}