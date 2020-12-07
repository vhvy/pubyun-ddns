使用前修改`index.js`文件中的相关选项
```
    identification: 用户名
    password: 密码
    id: 域名id，手动在网页更新域名IP时在网络请求里可以看到相关id
```

然后将项目路径填写到`run.sh`里，并用`crontab`进行定时执行

例如每隔30分钟执行一次

```
crontab -e
*/30 * * * * /bin/bash /your.path/run.sh
```