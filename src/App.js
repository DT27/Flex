import React, { Component } from 'react';
import {
  Container,
  Menu,
  Card,
  Button,
  Icon,
  Modal,
  Header,
  Segment,
  Checkbox
} from 'semantic-ui-react';
import axios from "axios";
import { WidthProvider, Responsive } from "react-grid-layout";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

/**
 * 多段开关
 */
function SelectorButton(props) {
  const device = props.device;
  function handleClick(item, e) {
    this.SwitchSelectorDevice(device, item);
    e.stopPropagation();
  }
  if (device.ttt === 'selector') {
    const listItems = device.levels.map((item) =>
      <Button key={item} onClick={(e) => handleClick(item, e)}>{item}</Button>
    );
    return <Card.Content extra>
      <Button.Group size="tiny" compact basic>
        {listItems}
      </Button.Group>
    </Card.Content>;
  } else
    return <span></span>;
}

class App extends Component {
  static defaultProps = {
    className: "layout",
    breakpoints: { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 },
    cols: { lg: 12, md: 10, sm: 8, xs: 6, xxs: 4 },
    // eslint-disable-next-line
    rowHeight: domoticz.rowHeight,
  };
  constructor(props) {
    super(props);
    this.state = {
      devices: [],
      layouts: {},
      count: 0,
      sunrise: '',
      sunset: '',
      currentBreakpoint: 'lg',
      checked: false
    };
    this.getDevices = this
      .getDevices
      .bind(this);
  }
  toggle = () => this.setState({ checked: !this.state.checked })
  componentWillMount() {
    this.getDevices();
  }
  onLayoutChange = (layout, layouts) => {
    if (layout.length > 0) {
      let lays = getFromLS("layouts") ? JSON.parse(JSON.stringify(getFromLS("layouts"))) : {};
      lays[this.state.currentBreakpoint] = layout;
      this.setState({ layouts: lays });
      saveToLS("layouts", lays);
    }
    // eslint-disable-next-line
    //console.log("change")
  }

  onBreakpointChange = breakpoint => {
    //lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0
    //console.log(breakpoint);
    switch (breakpoint) {
      case "lg":
        // eslint-disable-next-line
        domoticz.colNum = 12;
        break;
      case "md":
        // eslint-disable-next-line
        domoticz.colNum = 10;
        break;
      case "sm":
        // eslint-disable-next-line
        domoticz.colNum = 8;
        break;
      case "xs":
        // eslint-disable-next-line
        domoticz.colNum = 6;
        break;
      case "xxs":
        // eslint-disable-next-line
        domoticz.colNum = 4;
        break;
      default:
        // eslint-disable-next-line
        domoticz.colNum = 12;
        break;
    }
    // eslint-disable-next-line
    //console.log(domoticz.colNum);
    this.setState({
      currentBreakpoint: breakpoint
    });

    let lays = getFromLS("layouts") ? JSON.parse(JSON.stringify(getFromLS("layouts"))) : {};
    if (!lays[breakpoint] === undefined)
      this.setState({ layouts: lays });
    else
      this.getDevices();
  };
  resetLayout() {
    saveToLS("layouts", {});
    this.getDevices();
  }
  clicked(device, action) {
    //console.log(device.Type);
    if (!this.state.checked) {
      if (device.Type === 'Light/Switch' && device.SwitchType === "On/Off") {
        this.SwitchDevice(device, action);
      } else if (device.Type === 'General') {

      } else {
        console.log("暂不支持该动作")
      }
    }
  }
  /**
 * 切换普通开关状态
 * @param device
 */
  SwitchDevice(device, action) {
    var app = this;
    var targetStatus = device.Status === "Off" ? "On" : "Off";
    // eslint-disable-next-line
    axios.get(domoticz.server + 'json.htm?type=command&param=switchlight&idx=' + device.idx + '&switchcmd=' + targetStatus)
      .then(function (response) {
        if (response.data.status === "OK") {
          setTimeout(app.getDevices, 500);

          console.log(device.Name + " Switch to " + targetStatus);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }


  /**
   * 切换多段开关状态
   * @param device
   */
  SwitchSelectorDevice(device, item) {
    var app = this;
    // eslint-disable-next-line
    axios.get(domoticz.server + 'json.htm?type=command&param=switchlight&idx=' + device.idx + '&switchcmd=Set%20Level&level=' + item)
      .then(function (response) {
        if (response.data.status === "OK") {
          setTimeout(app.GetDevices, 500);

          console.log(device.Name + " Switch to " + item);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  }




  getDevices = () => {
    switch (this.state.currentBreakpoint) {
      case "lg":
        // eslint-disable-next-line
        domoticz.colNum = 12;
        break;
      case "md":
        // eslint-disable-next-line
        domoticz.colNum = 10;
        break;
      case "sm":
        // eslint-disable-next-line
        domoticz.colNum = 8;
        break;
      case "xs":
        // eslint-disable-next-line
        domoticz.colNum = 6;
        break;
      case "xxs":
        // eslint-disable-next-line
        domoticz.colNum = 4;
        break;
      default:
        // eslint-disable-next-line
        domoticz.colNum = 12;
        break;
    }
    // eslint-disable-next-line
    //console.log(domoticz.colNum);
    var app = this;
    axios
      // eslint-disable-next-line
      .get(domoticz.server + 'json.htm?type=devices&filter=all&used=true&order=Name')
      .then(function (response) {
        var tempDevices = [];
        var col = 0;
        var row = 0;
        var y = 0;
        var tempLayout = [];
        for (var i in response.data.result) {
          var device = response.data.result[i];
          var idx = device['idx'];
          // eslint-disable-next-line
          if ((domoticz.use_favorites && device['Favorite'] === 1) || !domoticz.use_favorites) {

            device['class'] = "";
            switch (device['Type']) {
              case 'Light/Switch':
                if (device['Status'] === "On") {
                  device['class'] = "on";
                } else if (device['Status'] === "Off") {
                  device['class'] = "off";
                } else {
                  device['class'] = "";
                }

                device['ttt'] = 'light';
                device['icon'] = 'lightbulb_outline';
                if (device['SubType'] === "Switch" && device['SwitchType'] === "On/Off")
                  device['showSwitch'] = true;
                if (device['SubType'] === "Selector Switch") {
                  device['ttt'] = 'selector';
                  device['class'] = "";
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
                device['ttt'] = 'general';
                break;
              default:
                device['ttt'] = '';
                device['icon'] = '';
                break;
            }

            var width = 2;
            var height = 2;
            switch (device['Type']) {
              case "Light/Switch":
              case "Lighting Limitless/Applamp":

                switch (device['SwitchType']) {
                  case 'Light/Switch':
                    break;
                  case 'Selector':
                    width = width * 2;
                    height = 3;
                    break;
                  case 'Media Player':

                    width = width * 3;
                    break;
                  case 'Dimmer':
                    width = width * 2;
                    break;
                  default:
                    width = 2;
                    break;
                }
                break;

              case 'General':
                height = 2;
                break;
              default:
                height = 2;
                break;
            }
            //console.log(device['Name']);
            if (getFromLS("layouts")) {
              let lays = JSON.parse(JSON.stringify(getFromLS("layouts")));
              //lays[this.state.currentBreakpoint]=layout;
              if (lays[app.state.currentBreakpoint]) {
                // eslint-disable-next-line
                lays[app.state.currentBreakpoint].forEach(element => {
                  if (device.idx === element.i) {
                    tempLayout[y] = element;
                  }
                });

              }
            }
            if (tempLayout[y] === undefined) {

              // eslint-disable-next-line
              //console.log(col + width)
              // eslint-disable-next-line
              if (col + width > domoticz.colNum) {
                col = 0;
                row++;
              }
              tempLayout[y] = {
                "i": idx,
                "x": col,
                "y": row,
                "w": width,
                "h": height,
                "minH": height
              };
            }
            //if (savedLayouts.lg || savedLayouts.md || savedLayouts.sm || savedLayouts.xs || savedLayouts.xxs) {

            //} else {
            device['layout'] = tempLayout[y];
            //}
            tempDevices[y] = device;
            col += width;
            y++;
          }
        }
        app.setState({ sunrise: response.data.Sunrise });
        app.setState({ sunset: response.data.Sunset });
        let size = app.state.currentBreakpoint;
        let layouts = {};
        layouts[size] = tempLayout;
        app.setState({ layouts });
        app.setState({ count: tempLayout.length });
        app.setState({ devices: tempDevices });
        //GetDevices();
        //console.log(tempLayout);
        //console.log(tempDevices);
      })
      .catch(function (error) {
        console.log(error);
      });
  }
  render() {
    //console.log(this.state.layouts);
    var listItems = [];

    if (this.state.devices.length > 0) {
      //console.log(this.state.layouts);
      listItems = this.state.devices.map((device) => <Card as="div" key={device.idx} className={device.ttt + " " + device.class} data-grid={device.layout} onClick={(e) => this.clicked(device)}>
        <Card.Content>
          <i className='flex-font icon-light big inverted icon right floated' />
          <Card.Header>
            {device.Name}
          </Card.Header>
          <Card.Meta>


          </Card.Meta>
          <Card.Description><span className='device-update'><Icon name='time' />{device.LastUpdate}</span></Card.Description>
        </Card.Content>
        <SelectorButton device={device} />
      </Card>);
    }
    //console.log(this.state.layout);
    return (
      <div className="App">
        <Menu fixed='top' inverted>
          <Container>
            <Menu.Item as='span' id='time'>{this.state.sunset}</Menu.Item>
            <Clock />
            <Modal trigger={<Menu.Item position='right'>
              <Icon name='setting' />
            </Menu.Item>}>
              <Modal.Header>Select a Photo</Modal.Header>
              <Modal.Content image>
                <Modal.Description>
                  <Header>设置</Header>
                  <Segment compact>
                    <Checkbox label='允许布局' toggle onChange={this.toggle} checked={this.state.checked} />
                  </Segment>
                  <Button onClick={(e) => this.resetLayout(e)}>重置布局</Button>
                </Modal.Description>
              </Modal.Content>
            </Modal>
          </Container>
        </Menu>
        <div style={{
          marginTop: '3em'
        }}>
          <ResponsiveReactGridLayout {...this.props}
            onLayoutChange={(layout, layouts) =>
              this.onLayoutChange(layout, layouts)}
            onBreakpointChange={this.onBreakpointChange}
            layouts={this.state.layouts}
            isResizable={this.state.checked}
            isDraggable={this.state.checked}
          >
            {listItems}
          </ResponsiveReactGridLayout>

        </div>
      </div>
    );
  }
}

export default App;



class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cd: new Date()
    };
  }
  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    this.setState({ cd: new Date() });
  }
  render() {
    return (
      <Menu.Item name='editorials'>
        <span>{this
          .state
          .cd
          .getFullYear() + '年' + (this.state.cd.getMonth() + 1) + '月' + this
            .state
            .cd
            .getDate() + '日'}</span>
        <span>{zeroPadding(this.state.cd.getHours(), 2) + ':' + zeroPadding(this.state.cd.getMinutes(), 2) + ':' + zeroPadding(this.state.cd.getSeconds(), 2)}</span>
        <span>{week[
          this
            .state
            .cd
            .getDay()
        ]}</span>
      </Menu.Item>
    );
  }
}

var week = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六'
];

function zeroPadding(num, digit) {
  var zero = '';
  for (var i = 0; i < digit; i++) {
    zero += '0';
  }
  return (zero + num).slice(-digit);
}

function saveToLS(key, value) {
  if (global.localStorage) {
    global.localStorage.setItem(
      "rgl-8",
      JSON.stringify({
        [key]: value
      })
    );
  }
}
function getFromLS(key) {
  let ls = {};
  if (global.localStorage) {
    try {
      ls = JSON.parse(global.localStorage.getItem("rgl-8")) || {};
    } catch (e) {
      /*Ignore*/
    }
  }
  return ls[key];
}
