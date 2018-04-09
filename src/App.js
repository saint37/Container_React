import React, { Component } from 'react';
import go from 'gojs';
import { Layout, Menu, Breadcrumb,Button } from 'antd';
import './App.css';
const { Header, Content, Footer } = Layout;
const $ = go.GraphObject.make;
//global
var CellSize = new go.Size(20, 20);
//Container
var groupFill = "rgba(128,128,128,0.2)";
var groupStroke = "rgba(128,128,128,0.4)";
var dropFill = "rgba(128,255,255,0.2)";
var dropStroke = "red";

class App extends Component {
    renderCanvas () {
        //global
        function showMessage(s) {
            document.getElementById("diagramEventsMsg").textContent = s;
        }

        function placebox(box,grp,n) {
            box.position.x = grp.position.x;
            box.position.y = grp.position.y + 20*(3-n);
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function placetrunk(box,grp,n) {
            box.position.x = grp.position.x;
            box.position.y = grp.position.y;
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function highlightGroup(grp, show) {
          if (!grp) return;
          if (show) {  // check that the drop may really happen into the Group
              grp.isHighlighted = true;
              return;
          }
          grp.isHighlighted = false;
        }

//=================================================================================================//

        var truckDiagram = //定义集卡
        $(go.Diagram, "truckDiagram",
        {
            "toolManager.mouseWheelBehavior":go.ToolManager.WheelNone,//鼠标滚轮事件禁止
            //显示网格
            grid: $(go.Panel, "Grid",
              { gridCellSize: CellSize },
              $(go.Shape, "LineH", { stroke: "lightgray" }),
              $(go.Shape, "LineV", { stroke: "lightgray" })
            ),
            //initialContentAlignment: go.Spot.Center, // 画布居中
            "undoManager.isEnabled": true, // 可以撤销
            allowZoom: true, // 可以缩放
            allowDrop: true, // 可以释放拖拽对象
            allowDragOut: true,
            "draggingTool.isGridSnapEnabled": true, // 对齐网格拖拽
            maxSelectionCount: 1, //最多选择一个节点
            "ExternalObjectsDropped": function(e) {
                console.log("clever st");
                if (myDiagram.commandHandler.canDeleteSelection() &&
                    !(myDiagram.lastInput.control || myDiagram.lastInput.meta)) {
                    myDiagram.commandHandler.deleteSelection();
                }
            }
        });

        truckDiagram.groupTemplate = //定义箱位
            $(go.Group, 
                {
                  layerName: "Background",
                  resizable:  false, //不能改变大小
                  movable: true, //不能移动
                  selectionAdorned: false, //选中后不显示选中框
                  //mouseEnter: function(e, node) { showMessage(node.key + "-Current Loc " + node.location); }
                  click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                  },
                  mouseDragEnter: function(e, grp, prev) { highlightGroup(grp, true); },
                  mouseDragLeave: function(e, grp, next) { highlightGroup(grp, false); },
                  mouseDrop: function(e, grp) {
                    grp.addMembers(grp.diagram.selection, true); //绑定箱到集卡
                    var box = grp.diagram.toolManager.draggingTool.currentPart;
                    console.log(box);
                    var boxnum = grp.memberParts.count; //集卡上最多一个箱
                    showMessage( box.key + "-Droped at-" + grp.key + " on " + grp.position + "/" + grp.data.pos);
                    if(boxnum <= 1){
                        placetrunk(box,grp,boxnum);
                    }
                    else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}
                  },
                },
                
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "RoundedRectangle",
                  { name: "SHAPE", // 取名
                    fill: groupFill,
                    stroke: groupStroke,
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : groupFill; }).ofObject(),
                  new go.Binding("stroke", "isHighlighted", function(h) { return h ? dropStroke: groupStroke; }).ofObject()),
            );

        truckDiagram.nodeTemplate = //集卡上的箱子
            $(go.Node, "Auto",
                {   selectionAdorned: false,
                    click: function(e, node) { 
                        var data = node.data;
                        showMessage(node.key + "-Current Loc of Box" + node.position + "/" + data.pos); 
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  {
                    fill: "#8bc34a",
                    stroke: "rgba(128,128,128,0.4)",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse)),
            );

        var truckModel = $(go.GraphLinksModel);
        truckModel.nodeDataArray = [
              { key: "G01", isGroup: true, pos: "0 0", size: "60 40" },
              { key: "G02", isGroup: true, pos: "80 0", size: "60 40" },
              { key: "G03", isGroup: true, pos: "160 0", size: "60 40" },
              { key: "G04", isGroup: true, pos: "240 0", size: "60 40" },
              { key: "G05", isGroup: true, pos: "320 0", size: "60 40" },
              { key: "G06", isGroup: true, pos: "400 0", size: "60 40" },
              { key: "B01", group: "G01", size: "40 20" },
              { key: "B02", group: "G02", size: "40 20" },
              { key: "B03", group: "G05", size: "40 20" },
        ];
        truckDiagram.model = truckModel;

//=================================================================================================//

        var myDiagram = //定义画布
        $(go.Diagram, "myDiagramDiv",
        {
            "toolManager.mouseWheelBehavior":go.ToolManager.WheelNone,//鼠标滚轮事件禁止
            //显示网格
            grid: $(go.Panel, "Grid",
              { gridCellSize: CellSize },
              $(go.Shape, "LineH", { stroke: "lightgray" }),
              $(go.Shape, "LineV", { stroke: "lightgray" })
            ),
            //initialContentAlignment: go.Spot.Center, // 画布居中
            "undoManager.isEnabled": true, // 可以撤销
            allowZoom: true, // 可以缩放
            allowDrop: true, // 可以释放拖拽对象
            allowDragOut: true, //可以拖出
            "draggingTool.isGridSnapEnabled": true, // 对齐网格拖拽
            maxSelectionCount: 1, //最多选择一个节点
            "ExternalObjectsDropped": function(e) {
              if (truckDiagram.commandHandler.canDeleteSelection() &&
                  !(truckDiagram.lastInput.control || truckDiagram.lastInput.meta)) {
                truckDiagram.commandHandler.deleteSelection();
              }
            }
        });

        myDiagram.groupTemplate = //定义箱位
            $(go.Group, 
                {
                  layerName: "Background",
                  resizable:  false, //不能改变大小
                  movable: false, //不能移动
                  selectionAdorned: false, //选中后不显示选中框
                  //mouseEnter: function(e, node) { showMessage(node.key + "-Current Loc " + node.location); }
                  click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                  },
                  mouseDragEnter: function(e, grp, prev) { highlightGroup(grp, true); },
                  mouseDragLeave: function(e, grp, next) { highlightGroup(grp, false); },
                  mouseDrop: function(e, grp) {
                    grp.addMembers(grp.diagram.selection, true); //绑定箱到新箱位
                    var box = grp.diagram.toolManager.draggingTool.currentPart;
                    console.log(box); //当前箱
                    var boxnum = grp.memberParts.count; //当前箱位所含箱数
                    showMessage( box.key + "-Droped at-" + grp.key + " on " + grp.position + "/" + grp.data.pos);
                    if(boxnum <= 3){
                        placebox(box,grp,boxnum);
                    }
                    else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}
                  },
                },
                
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                //Point.parse允许位置以字符串（“100 50”）的形式来指定，而不是作为一个表达式的点。
                //Point.stringify可以将位置信息输出成字符串string类型，用node.data.pos来取。
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: groupFill,
                    stroke: groupStroke,
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : groupFill; }).ofObject(),
                  new go.Binding("stroke", "isHighlighted", function(h) { return h ? dropStroke: groupStroke; }).ofObject()),
            );

        myDiagram.nodeTemplate = //定义箱子
            $(go.Node, "Auto",
                {   selectionAdorned: false,
                    click: function(e, node) { 
                        var data = node.data;
                        showMessage(node.key + "-Current Loc of Box" + node.position + "/" + data.pos); 
                        //通过key获取node对象
                        //var obj = myDiagram.findNodeForKey("B1");
                        //console.log(obj);
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  {
                    fill: "#1890ff",
                    stroke: "rgba(128,128,128,0.4)",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse)),
            );

        var myModel = $(go.GraphLinksModel);
        myModel.nodeDataArray = [
              { key: "G1", isGroup: true, pos: "0 0", size: "40 60" },
              { key: "G2", isGroup: true, pos: "40 0", size: "40 60" },
              { key: "G3", isGroup: true, pos: "80 0", size: "40 60" },
              { key: "G4", isGroup: true, pos: "120 0", size: "40 60" },
              { key: "G5", isGroup: true, pos: "160 0", size: "40 60" },
              { key: "B1", group: "G1", size: "40 20" },
              { key: "B2", group: "G2", size: "40 20" },
              { key: "B3", group: "G4", size: "40 20" },
              { key: "B4", group: "G5", size: "40 20" },
        ];
        myDiagram.model = myModel;
    }

    componentDidMount () {
        this.renderCanvas ();
    }

    render() {
        return (
          <div className="App">
            <Layout className="layout">
                <Header>
                    <div className="logo" />
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['1']}
                        style={{ lineHeight: '64px' }}
                    >
                        <Menu.Item key="1">装火车</Menu.Item>
                        <Menu.Item key="2">卸火车</Menu.Item>
                        <Menu.Item key="3">装集卡</Menu.Item>
                        <Menu.Item key="4">卸集卡</Menu.Item>
                    </Menu>
                </Header>
                <Content style={{ padding: '0 50px' }}>
                    <div id="diagramEventsMsg">msg</div>
                    <div style={{ background: '#fff', padding: 24, minHeight: 100 }}>
                        <div id="truckDiagram" style={{'width': '1200px', 'height': '100px', 'backgroundColor': '#DAE4E4'}}></div>
                    </div>
                    <div style={{ background: '#fff', padding: 24, minHeight: 100 }}>
                        <div id="myDiagramDiv" style={{'width': '1200px', 'height': '300px', 'backgroundColor': '#DAE4E4'}}></div>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Rails ©2018 Created by ST
                </Footer>
            </Layout>
          </div>
        );
    }
}

export default App;