const axios = require("axios");
const FormData = require("form-data");
const cheerio = require("cheerio");

const baseURL = "https://www.pubyun.com";

const loginPath = "/accounts/signin/";

const getIpPath = "https://httpbin.org/ip";

const updatePath = "/user/dyndns/rrs/dyndnsorstatic/";

const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36";

const identification = "";
// 登录用户名

const password = "";
// 登录密码

const id = "";
// ddns 资源id

const http = axios.create({
    baseURL,
    headers: {
        "User-Agent": userAgent
    }
});

function createData(obj) {
    // 创建form
    const form = new FormData();
    Object.keys(obj).map(k => {
        form.append(k, obj[k]);
    });

    const header = form.getHeaders();
    return {
        header,
        form
    };
}

function parseCookie(cookie) {
    let o = {};
    cookie
        .reduce((a, b) => {
            const list = b.split(";");
            return [...a, ...list]
        }, [])
        .map(k => {
            const [a, b] = k.split('=');
            o[a.trim()] = b
        });
    return o;
}

async function login() {
    const loginRes = await http.get(loginPath);

    const cookie = parseCookie(loginRes.headers['set-cookie']);

    const { form, header } = createData({
        identification,
        password,
        csrfmiddlewaretoken: cookie['csrftoken']
    });

    const res = await http.post(loginPath, form, {
        headers: {
            ...header,
            Referer: "https://www.pubyun.com/accounts/signin/",
            cookie: "csrftoken=" + cookie['csrftoken'] + "; sessionid=" + cookie['sessionid']
        },
    });

    return parseCookie(res.headers['set-cookie']);
}

async function checkedIp(cookie, ip) {

    const path = updatePath + id + "/";

    const res = await http.get(path, {
        headers: {
            cookie: "csrftoken=" + cookie['csrftoken'] + "; sessionid=" + cookie['sessionid'],
            referer: "https://www.pubyun.com/user/"
        }
    });

    const $ = cheerio.load(res.data);

    const currentIp = $("input[name=ip]").val();

    return {
        ipEqual: currentIp === ip,
        postCookie: parseCookie(res.headers['set-cookie'])
    }
}

async function update(cookie, ip) {

    const { header, form } = createData({
        ftype: 1,
        issetpass: 0,
        ip,
        isWildCard: 0,
        isBackMx: 0,
        csrfmiddlewaretoken: cookie['csrftoken']
    });

    const path = updatePath + id + "/";
    // 请求路径

    await http.post(path, form, {
        headers: {
            ...header,
            cookie: "csrftoken=" + cookie['csrftoken'] + "; sessionid=" + cookie['sessionid'],
            referer: baseURL + path
        },
    });
}

async function getIp() {
    const res = await http.get(getIpPath);
    return res.data.origin;
}

async function main() {
    const ip = await getIp();
    const cookie = await login();
    const { ipEqual, postCookie } = await checkedIp(cookie, ip);
    !ipEqual && await update(postCookie, ip);
}

main();