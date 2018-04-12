/**
 * Created by DT27 on 2018/3/26.
 */


Vue.component('clock-component', {
    template: '<div class="clock text-xs-center"><span class="date">{{ date }} {{ week }}</span> <span class="time">{{ time }}</span><span class="sun"><v-icon class="flex-font icon-wi-sunrise"></v-icon> {{ sunrise }} <v-icon class="flex-font icon-wi-sunset"></v-icon> {{ sunset }}</span></div>',
    props: ['time',
        'date',
        'week',
        'sunrise',
        'sunset',
        'setDialog',
    ]
})



var GridLayout = VueGridLayout.GridLayout;
var GridItem = VueGridLayout.GridItem;
var layout = [];

try {
    //layout = this.$cookies.isKey('layout') ? JSON.parse(this.$cookies.get('layout')) : [];
} catch (e) {
    this.$cookies.remove('layout')
    layout = [];
}


var devicesLayout = [];

var devices = [];

var mainLayout = new Vue({
    el: '#mainLayout',
    components: {
        "GridLayout": GridLayout,
        "GridItem": GridItem
    },
    data: {
        layout: devicesLayout,
        device: devices,
        draggable: false,
        resizable: false,
        index: 0,
        count: 0,
        colNum: domoticz.colNum,
        time: '',
        date: '',
        week: '',
        sunrise: '',
        sunset: '',
        setDialog: false
    },
    methods: {
        clicked: function (i, draggable, event) {
            if (!draggable) {
                if (this.device[i].Type == 'Light/Switch' && this.device[i].SwitchType == "On/Off") {
                    SwitchDevice(this.device[i]);
                } else if (this.device[i].Type == 'General') {

                } else {
                    console.log("暂不支持该动作")
                }
            }
        },
        layoutUpdatedEvent: function (newLayout) {
            layout = newLayout;
            this.$cookies.set("layout", JSON.stringify(newLayout), Infinity);
        },
        increaseWidth: function (item) {
            var width = document.getElementById("content").offsetWidth;
            width += 20;
            document.getElementById("content").style.width = width + "px";
        },
        decreaseWidth: function (item) {
            var width = document.getElementById("content").offsetWidth;
            width -= 20;
            document.getElementById("content").style.width = width + "px";
        },
        removeItem: function (item) {
            //console.log("### REMOVE " + item.i);
            this.layout.splice(this.layout.indexOf(item), 1);
        },
        addItem: function () {
            var self = this;
            //console.log("### LENGTH: " + this.layout.length);
            var item = {
                "x": 0,
                "y": 0,
                "w": 2,
                "h": 2,
                "i": this.index + "",
                whatever: "bbb"
            };
            this.index++;
            this.layout.push(item);
        },
        move: function (i) {
            console.log("MOVE i=");
        },
        resize: function (i, newH, newW) {
            console.log("RESIZE i=" + i + ", H=" + newH + ", W=" + newW);
        },
        moved: function (i, newX, newY) {
            console.log("### MOVED i=" + i + ", X=" + newX + ", Y=" + newY);
        },
        resized: function (i, newH, newW, newHPx, newWPx) {
            console.log("### RESIZED i=" + i + ", H=" + newH + ", W=" + newW + ", H(px)=" + newHPx + ", W(px)=" + newWPx);
        },
    },
});


GetDevices();
//获取所有设备
function GetDevices() {
    axios.get('Test/AllDevices.json?type=devices&filter=all&used=true&order=Name')
        .then(function (response) {
            mainLayout.sunrise = response.data.Sunrise;
            mainLayout.sunset = response.data.Sunset;
            var col = 0;
            var row = 0;
            var y = 0;
            var tempLayout = [];
            for (var i in response.data.result) {
                var device = response.data.result[i];
                var idx = device['idx'];
                if ((domoticz.use_favorites && device['Favorite'] == 1) || !domoticz.use_favorites) {
                    device['class'] = "";
                    switch (device['Type']) {
                        case 'Light/Switch':
                            if (device['Status'] == "On") {
                                device['class'] = "deep-orange on";
                            } else if (device['Status'] == "Off") {
                                device['class'] = "blue off";
                            } else {
                                device['class'] = "blue";
                            }

                            device['type'] = 'light';
                            device['icon'] = 'lightbulb_outline';
                            if (device['SubType'] == "Switch" && device['SwitchType'] == "On/Off")
                                device['showSwitch'] = true;
                            if (device['SubType'] == "Selector Switch") {
                                device['type'] = 'selector';
                                device['class'] = "green";
                                device['levels'] = device['LevelNames'].split('|');
                                device['levelCur'] = device['LevelInt'] / 10;
                                if (device['Name'].indexOf("扇") > 0) {
                                    device['icon'] = 'flex-font icon-fan';
                                } else {
                                    device['icon'] = 'flex-font icon-fan';
                                }
                            }
                            break;
                        case 'General':
                            device['class'] = device['Status'];
                            device['type'] = 'general';
                            break;
                    }
                    devices[idx] = device;

                    l = [];
                    for (var a = 0; a < layout.length; a++) {
                        if (layout[a].i == idx) {
                            l = layout[a];
                        }
                    }
                    if (l["i"] > 0) {
                        tempLayout[y] = l;
                    } else {
                        var width = 2;
                        var height = 3;
                        switch (device['Type']) {
                            case "Light/Switch":
                            case "Lighting Limitless/Applamp":

                                switch (device['SwitchType']) {
                                    case 'Light/Switch':
                                        break;
                                    case 'Selector':
                                        width = width * 2;
                                        height = 4;
                                        break;
                                    case 'Media Player':

                                        width = width * 3;
                                        break;
                                    case 'Dimmer':
                                        width = width * 2;
                                        break;
                                }
                                break;

                            case 'General':
                                height = 5;
                                break;
                        }
                        if (col + width > domoticz.colNum) {
                            col = 0;
                            row++;
                        }
                        //console.log(device['Name']);
                        tempLayout[y] = {
                            "x": col,
                            "y": row,
                            "w": width,
                            "h": height,
                            "i": idx
                        };
                    }
                    col += width;
                    y++;
                }
            }
            mainLayout.layout = tempLayout;
            mainLayout.count = tempLayout.length;
            //GetDevices();
            //console.log("success");
        })
        .catch(function (error) {
            console.log(error);
        });
}

/**
 * 切换开关状态
 * @param device
 * @constructor
 */
function SwitchDevice(device) {
    targetStatus = device.Status == "Off" ? "On" : "Off";
    axios.get(domoticz.server + '/json.htm?type=command&param=switchlight&idx=' + device.idx + '&switchcmd=' + targetStatus, {
            auth: {
                username: domoticz.username,
                password: domoticz.password
            }
        })
        .then(function (response) {
            if (response.data.status == "OK") {
                setTimeout(GetDevices, 500);

                console.log(device.Name + " Switch to " + targetStatus);
            }
        })
        .catch(function (error) {
            console.log(error);
        });
}

function resetLayout() {
    this.$cookies.remove('layout')
    layout = [];
    GetDevices();
}


var week = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
var timerID = setInterval(updateTime, 1000);
updateTime();

function updateTime() {
    var cd = new Date();
    mainLayout.time = zeroPadding(cd.getHours(), 2) + ':' + zeroPadding(cd.getMinutes(), 2) + ':' + zeroPadding(cd.getSeconds(), 2);
    mainLayout.date = cd.getFullYear() + '年' + (cd.getMonth() + 1) + '月' + cd.getDate() + '日';
    mainLayout.week = week[cd.getDay()];
};

function zeroPadding(num, digit) {
    var zero = '';
    for (var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}