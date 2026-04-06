**注意：** 将数据库持久化写入数据库前应思考，这个数据是否真的需要保存到数据库中，如果只是通过运行时计算的数据，请加入到 `ServerRuntimeInterface.ts` 运行时接口中使用。

**必须遵守：** 数据库列名、数据类型、后端接口发送键名、前端调用键名，均以 `ServerRuntimeInterface.ts` 中定义的名称一致，不得混用乱用，防止后期维护混乱。

## 后端变动

### 配置接口与实现
1. 前往 接口 `\server\src\interface\ServerConfigInterface.ts` 添加值
2. 更新 `src\server\src\core\gameServer.ts` class GameServer 与 constructor() 对应值与默认值


### 持久化写入数据库

数据库定义的列名称应与接口定义的名称一致，以防数据混乱。

1. 前往 `server` 表数据库类 `src\server\src\database\serverDatabase.ts`
2. 更新数据库表 `initTable()` 中的 `CREATE TABLE` 添加接口新实现的列
3. 为了向前兼容通过封装函数 `ensureColumn('表名(server)', '列名', '列定义')` 来更新已存在的数据库表
4. 在 `add()` 新增服务器记录函数中更新新增接口名称(INSERT)与值(VALUES)
5. 在 `get()` 查询中新增接口名称
6. 在 `update()` 更新服务器记录中更新新增接口名称按照以下方式拼接SQL语句
```typescript
// SQLLite不支持布尔值需要以 INTEGER 存入
update() {
    if (updates.接口定义的名称 !== undefined) {
        fields.push('接口定义的名称 = ?')
        // 直接写内容
        values.push(updates.接口定义的名称)
        // 布尔值判断
        values.push(updates.接口定义的名称 ? 1 : 0)
    }
}
```
7.在 `getAll()` 获取全部服务器列表中更新SQL语句与返回数据

### 接口数据提供至前端实现

1. 前往 `src\server\src\core\serverManager.ts` 服务器管理
2. `update()` 维护更新服务器函数的空值检测部分(如需要的话) `if (config.接口定义的名称 !== undefined)`

## 前端变动

注意：接口定义的名称必须与后端一致，防止出现混乱。

前端后续更新为 TS语法版本，很多写的还太乱大致需要维护以下几个内容

### 更新新建、编辑服务器 dialog

1. 前往 `src\web\src\components\dialogs\AddServerDialog.vue`
2. 更新 formData 的 ref()
```
// 表单数据
const formData = ref({
  name: '',
  fileName: '',
  command: '',
  cwd: '',
  forceUtf8Mode: false,
  usePty: true,
  // 在这里新增 接口定义的名称
})
```
3. 更新需要重置的表单数据
```
// 重置表单（清空所有输入）
const resetForm = () => {
  formData.value = {
    name: '',
    fileName: '',
    command: '',
    cwd: '',
    forceUtf8Mode: false, // 默认值 false
    usePty: true, // 默认值 true
    // 在这里新增 接口定义的名称
  }
  errorMsg.value = ''
}
```
4. 更新传入的对象数据
```
// 从传入的 server 对象填充表单
const fillForm = () => {
  if (props.server) {
    formData.value = {
      name: props.server.name,
      fileName: props.server.fileName,
      command: props.server.command,
      cwd: props.server.cwd,
      forceUtf8Mode: props.server.forceUtf8Mode,
      usePty: props.server.usePty,
      // 在这里新增 接口定义的名称
    }
  } else {
    resetForm()
  }
}
```
5. HTML标签通过 ` v-model="formData.接口定义的名称"` 进行数据绑定用于更新