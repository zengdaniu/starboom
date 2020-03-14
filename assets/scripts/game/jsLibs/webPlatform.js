class GamePlatform {
    constructor() {
        this.name = "shenyou";
        this.banner = "";
        this.viedo = "";
        this.position = "";
    }

    /**
     * 登陆
     */
    login() { }
    //保存用户信息
    saveUserData() { }
    //展示横幅广告
    showBanner() { }
    //展示视频广告
    showVideo() { }
    //隐藏横幅广告
    hideBanner() { }
    //隐藏视频广告
    hideViedo() { }
    //引导添加小程序
    addApplet() { }
    //显示转发按钮
    shareMenu() { }
    //防沉迷
    getAntiAddiction() { }
    //获取拉取小游戏列表信息
    getGameInfo() { }
    //跳转另一个游戏
    jumpProgram() { }
}

class DebuWebPlatform extends GamePlatform {
    constructor() {
        super();
        this.name = "web"

    }

    init(position) {
        //初始化广告信息
        this.position = position;  //横幅位置

    }

    login(s, e, thisobj) {
        let http = new XMLHttpRequest();
        let url = "https://lsxyx.5884.com/api/xyx/user/kzhz/login/";
        url = url + "test1001";
        url = url + "/" + this.name;
        console.log(url);
        http.open("GET", url);
        http.send();
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                var data = JSON.parse(http.responseText);
                console.log("取数据：" + data);
                s.call(thisobj, data);
            } else {
                console.log("取数据请求错误");
                e.call(thisobj, "请求错误");
            }
        }

    }

    saveUserData(openid, userdata) {
        let datastr = "openid=" + openid + "&proxy=web&data=" + userdata;
        let http = new XMLHttpRequest();
        let url = "https://lsxyx.5884.com/api/xyx/user/update";
        http.open("POST", url, true);
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                console.log("存数据成功");
            } else {
                console.log("存数据请求错误");
            }
        }
        http.send(datastr);

    }

    //横幅广告测试
    showBanner(s, e, thisobj) {
        let status = true;
        s.call(thisobj, status);
        e.call(thisobj, false);
    }

    //视频广告测试
    showVideo(s, e, c, thisobj, orderNum = 0) {
        let status = true;
        //s.call(thisobj, status);
        //e.call(thisobj, false);
        c.call(thisobj, status);
    }


    hideBanner() {
        console.log("关闭banner广告");
    }

    /**
     * 引导添加小程序
     * @param s  添加成功
     * @param e  添加失败
     * @param thisobj  作用域
     */
    addApplet(s, e, thisobj) {
        s.call(thisobj, true);
        e.call(thisobj, false);
    }

    /**
     * 显示转发按钮
     * @param s  成功
     * @param e  失败
     * @param thisobj  作用域
     */
    shareMenu(s, e, thisobj) {
        s.call(thisobj, true);
        e.call(thisobj, false);
    }

    /**
     * 设置防沉迷
     * @param s  防沉迷时间内（10001、10002、10003）
     * @param e  防沉迷时间外
     * @param thisobj  作用域
     */
    getAntiAddiction(s, e, thisobj) {
        let state = 10001;
        s.call(thisobj, state);
        e.call(thisobj, -1);
    }

    /**
     * 获取拉取小游戏列表信息
     * @param s  获取列表信息成功，并返回小游戏信息
     * @param e  获取列表信息失败
     * @param thisobj  作用域
     */
    getGameInfo(s, e, thisobj) {
        console.log("获取小游戏列表信息");
        let userinfo = new Object
        let http = new XMLHttpRequest();
        let url = "https://lsxyx.5884.com/api/xyx/user/getgminfo/";
        url = url + "mengchong";   //游戏名，排除该游戏本身信息，mengchong(萌宠)、eliminatezombies(消灭僵尸)
        // url = url + "/" + this.name;  //渠道名，测试时用baidu
        url = url + "/" + "baidu";
        http.open("GET", url);
        http.send();
        http.onreadystatechange = function () {
            if (this.readyState == 4 && this.status == 200) {
                userinfo = JSON.parse(http.responseText);
                s.call(thisobj, userinfo);
            } else {
                let error = new Object;
                error.code = 999
                e.call(thisobj, error)
            }
        }

    }


    /**
     * 跳转另一个小程序
     * appkey  返游戏gamekey
     */
    jumpProgram(appkey) {
        console.log("跳转另一个游戏");
    }

}



window.platform = new DebuWebPlatform()