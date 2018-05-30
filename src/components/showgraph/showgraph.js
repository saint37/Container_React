import React, { Component } from 'react';
import axios from 'axios';
import go from 'gojs';
import './showgraph.css';
import { Row, Col, Button, Input, Icon } from 'antd';
import INIT from './init';
import graphC from './graphC';
import containerimg from '../assets/container-current.png';
import truckimg from '../assets/truck.png';
import trainimg from '../assets/train.png';
import craneimg from '../assets/crane.png';

const $ = go.GraphObject.make;
//global
var CellSize = new go.Size(20, 20);
//Container
var groupFill = "rgba(233,233,233,0.2)";
var groupStroke = "rgba(128,128,128,0.4)";
var dropFill = "rgba(255,255,255,0.2)";
var dropStroke = "lightblue";
//Indicator
var gradIndicatorHoriz;
var gradIndicatorVert;
//Diagram
var myDiagram;

class ShowGraph extends Component {
    renderCanvas () {
        let _self = this;
        //global
        function showMessage(s) {
            console.log(s);
        }

        function showBox(mousePT, node){
            _self.setState({
                showBox:true
            });
            var box = document.getElementById("currentBox");
            var s = "箱号：<br/>" + node.data.name;
            box.innerHTML = s;
            box.style.left = mousePT.x + 20 + "px";
            box.style.top = mousePT.y + "px";
        }

        function hideBox(node){
            _self.setState({
                showBox:false
            });
        }

        myDiagram = //定义画布
        $(go.Diagram, "myDiagramDiv",
        {
            //显示网格
            grid: $(go.Panel, "Grid",
              { gridCellSize: CellSize },
              $(go.Shape, "LineH", { stroke: "lightgray" }),
              $(go.Shape, "LineV", { stroke: "lightgray" })
            ),
            //scrollMode: go.Diagram.InfiniteScroll,  // 可以滚动
            padding: 0,  // 边距为0
            "undoManager.isEnabled": true, // 可以撤销
            allowZoom: true, // 可以缩放
            initialAutoScale: go.Diagram.Uniform,
            initialScale:0.8,
            initialContentAlignment: go.Spot.Center,
            //"draggingTool.isGridSnapEnabled": true, // 对齐网格拖拽
            maxSelectionCount: 1, //最多选择一个节点
        });

        myDiagram.groupTemplateMap.add("OfGroups", //划分箱区
            $(go.Group, "Horizontal",
                {
                    layerName: "Background",
                    movable: false, //不能移动
                    selectionAdorned: true, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                       INIT.setArea(_self,node);
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { 
                    stroke: "rgba(128,128,128,0.4)"
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "color")),
            ));

        myDiagram.groupTemplateMap.add("OfGroupsT", //划分集卡，火车区域
            $(go.Group, "Horizontal",
                {
                    layerName: "Background",
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    layout: //默认横向排列
                        $(go.GridLayout,
                          { wrappingColumn: NaN, 
                            alignment: go.GridLayout.Position,
                        })
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { 
                    stroke: "rgba(128,128,128,0.4)"
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "color")),
            ));

        myDiagram.groupTemplateMap.add("OfNodes", //箱位
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    defaultAlignment: go.Spot.Bottom,
                    computesBoundsAfterDrag: true,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Panel,
                'Vertical',
                { height: 50 },
                $(go.Shape, "Rectangle",
                    {
                    fill: groupFill,
                    stroke: groupStroke,
                    },
                    new go.Binding("desiredSize", "size", go.Size.parse),
                    new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : groupFill; }).ofObject(),
                    new go.Binding("stroke", "isHighlighted", function(h) { return h ? dropStroke: groupStroke; }).ofObject()),
                $(go.TextBlock,     // group title near top, next to button
                    { font: "10pt Sans-Serif", stroke:"#607d8b" },
                    new go.Binding("text", "name"))                    
                )
            ));

        myDiagram.groupTemplateMap.add("OfTruck", //集卡
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    }
                },
                //new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: "transparent",
                    stroke: "transparent",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : "transparent"; }).ofObject()),
                $(go.Panel,
                    'Vertical',
                    {
                        height: 60
                    },
                    $(go.Picture,
                        { 
                            margin: 10, width: 80, height: 25, 
                            background: "transparent", alignment: go.Spot.BottomCenter,
                            source:truckimg
                        },
                        new go.Binding("source", "url")),
                    $(go.TextBlock,     // group title near top, next to button
                        { font: "10pt Sans-Serif", stroke:"#607d8b" },
                        new go.Binding("text", "name"))                    
                    )
            ));

        myDiagram.groupTemplateMap.add("OfTrain", //火车
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: "transparent",
                    stroke: "transparent",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : "transparent"; }).ofObject()),
                $(go.Panel,
                    'Position',
                    {
                        height: 60
                    },
                    $(go.Picture,
                        { 
                            width: 100, height: 15,  position: new go.Point(0, 25),
                            background: "transparent", alignment: go.Spot.BottomCenter,
                            source:trainimg
                        },
                        new go.Binding("source", "url")),
                    $(go.TextBlock,     // group title near top, next to button
                        { font: "10pt Sans-Serif", stroke:"#001529",position: new go.Point(20, 45), },
                        new go.Binding("text", "name"))                    
                    )
            ));

        myDiagram.groupTemplateMap.add("OfCrane", //龙门吊
            $(go.Group, "Auto",
                {
                    layerName: "Crane",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: "#9f020a",
                    stroke: "transparent",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse)),
                $(go.Picture,
                    { 
                        margin: 0, width: 20, height: 560, 
                        background: "transparent", alignment: go.Spot.BottomCenter,
                        source:craneimg
                    }),
            ));

        myDiagram.nodeTemplate = //定义箱子
            $(go.Node, "Auto",
                {   
                    selectionAdorned: true,
                    movable: false, //不能移动
                    mouseEnter: function (e, obj) { 
                        //console.log(e.viewPoint);
                        showBox(e.viewPoint, obj.part); 
                    },
                    mouseLeave: function (e, obj) { hideBox(obj.part); },
                    click: function(e, node) { 
                        var data = node.data;
                        showMessage(node.key + "-" + data.group + ":" + node.position + "/" + data.pos); 
                        //INIT.setSingle(_self,node);
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                    {
                        fill: "#1890ff",
                        stroke: "rgba(128,128,128,0.4)",
                    },
                    new go.Binding("desiredSize", "size", go.Size.parse)),
                $(go.Picture,
                    { 
                        margin: 0, width: 40, height: 20, background: "gray", source:containerimg
                    },
                    new go.Binding("source", "url")),
            );

        // show feedback during the drag in the background
        myDiagram.mouseDragOver = function(e) {
            e.diagram.currentCursor = "not-allowed";
        };
        // disallow dropping in the background
        myDiagram.mouseDrop = function(e) {
            e.diagram.currentTool.doCancel();
        };

        // 画布坐标
        var gradScaleHoriz = //横坐标
          $(go.Node, "Graduated",
            { 
              graduatedTickUnit: 10, pickable: false, layerName: "Foreground",
              isInDocumentBounds: false, isAnimated: false
            },
            $(go.Shape, { geometryString: "M0 0 H400" }),
            $(go.Shape, { geometryString: "M0 0 V3", interval: 1 }),
            $(go.Shape, { geometryString: "M0 0 V15", interval: 5 }),
            $(go.TextBlock, 
              { 
                font: "10px sans-serif",
                interval: 5,
                alignmentFocus: go.Spot.TopLeft,
                segmentOffset: new go.Point(0, 7)
              }
            )
          );
        
        var gradScaleVert = //纵坐标
          $(go.Node, "Graduated",
            { 
              graduatedTickUnit: 10, pickable: false, layerName: "Foreground",
              isInDocumentBounds: false, isAnimated: false
            },
            $(go.Shape, { geometryString: "M0 0 V400" }),
            $(go.Shape, { geometryString: "M0 0 V3", interval: 1, alignmentFocus: go.Spot.Bottom }),
            $(go.Shape, { geometryString: "M0 0 V15", interval: 5, alignmentFocus: go.Spot.Bottom }),
            $(go.TextBlock, 
              { 
                font: "10px sans-serif",
                segmentOrientation: go.Link.OrientOpposite,
                interval: 5,
                alignmentFocus: go.Spot.BottomLeft,
                segmentOffset: new go.Point(0, -7)
              }
            )
          );

        // 鼠标移动位置
        gradIndicatorHoriz = //定义鼠标横坐标
          $(go.Node,
            { 
              pickable: false, layerName: "Foreground", visible: false,
              isInDocumentBounds: false, isAnimated: false,
              locationSpot: go.Spot.Top
            },
            $(go.Shape, { geometryString: "M0 0 V15", strokeWidth: 2, stroke: "red" })
          );

        gradIndicatorVert = //定义鼠标纵坐标
          $(go.Node,
            { 
              pickable: false, layerName: "Foreground", visible: false,
              isInDocumentBounds: false, isAnimated: false,
              locationSpot: go.Spot.Left
            },
            $(go.Shape, { geometryString: "M0 0 H15", strokeWidth: 2, stroke: "red" })
          );

        // 初始化标尺
        myDiagram.addDiagramListener("InitialLayoutCompleted", setupScalesAndIndicators);
        myDiagram.addDiagramListener("ViewportBoundsChanged", updateScales);
        myDiagram.addDiagramListener("ViewportBoundsChanged", updateIndicators);
        // 移动鼠标时更新
        myDiagram.toolManager.doMouseMove = function() {
          go.ToolManager.prototype.doMouseMove.call(this);
          updateIndicators();
        }
        myDiagram.toolManager.linkingTool.doMouseMove = function() {
          go.LinkingTool.prototype.doMouseMove.call(this);
          updateIndicators();
        }
        myDiagram.toolManager.draggingTool.doMouseMove = function() {
          go.DraggingTool.prototype.doMouseMove.call(this);
          updateIndicators();
        }
        myDiagram.toolManager.dragSelectingTool.doMouseMove = function() {
          go.DragSelectingTool.prototype.doMouseMove.call(this);
          updateIndicators();
        }
        // No need to override PanningTool since the ViewportBoundsChanged listener will fire

        function setupScalesAndIndicators() {
          var vb = myDiagram.viewportBounds;
          myDiagram.startTransaction("add scales");
          updateScales();
          // Add each node to the diagram
          myDiagram.add(gradScaleHoriz);
          myDiagram.add(gradScaleVert);
          myDiagram.add(gradIndicatorHoriz);
          myDiagram.add(gradIndicatorVert);
          myDiagram.commitTransaction("add scales");
        }

        function updateScales() {
          var vb = myDiagram.viewportBounds;
          myDiagram.startTransaction("update scales");
          // Update properties of horizontal scale to reflect viewport
          gradScaleHoriz.location = new go.Point(vb.x, vb.y);
          gradScaleHoriz.graduatedMin = vb.x;
          gradScaleHoriz.graduatedMax = vb.x + vb.width;
          gradScaleHoriz.elt(0).width = vb.width;
          // Update properties of vertical scale to reflect viewport
          gradScaleVert.location = new go.Point(vb.x, vb.y);
          gradScaleVert.graduatedMin = vb.y;
          gradScaleVert.graduatedMax = vb.y + vb.height;
          gradScaleVert.elt(0).height = vb.height;
          myDiagram.commitTransaction("update scales");
        }

        function updateIndicators() {
          var vb = myDiagram.viewportBounds;
          var mouseCoords = myDiagram.lastInput.documentPoint;
          myDiagram.startTransaction("update indicators");
          // Keep the indicators in line with the mouse as viewport changes or mouse moves
          gradIndicatorHoriz.location = new go.Point(Math.max(mouseCoords.x, vb.x), vb.y);
          gradIndicatorVert.location = new go.Point(vb.x, Math.max(mouseCoords.y, vb.y));
          myDiagram.commitTransaction("update indicators");
        }

        // read in the JSON-format data from the "mySavedModel" element
        this.load();
        //this.init();
    }

    // 监听鼠标移出画布，触发坐标隐藏
    hideIndicators() {
        myDiagram.startTransaction("hide indicators");
        gradIndicatorHoriz.visible = false;
        gradIndicatorVert.visible = false;
        myDiagram.commitTransaction("hide indicators");
      }

    // 监听鼠标移入画布，触发坐标显示
    showIndicators() {
        myDiagram.startTransaction("show indicators");
        gradIndicatorHoriz.visible = true;
        gradIndicatorVert.visible = true;
        myDiagram.commitTransaction("show indicators");
      }

    //放大缩小
    zoomOut() {
        myDiagram.commandHandler.increaseZoom();
    }

    zoomIn() {
        myDiagram.commandHandler.decreaseZoom();
    }

    zoomOri() {
        myDiagram.scale = 1;
    }

    init(){
        INIT.initDiagram(); //read data and set graphC.diagramValue
    }

    load() {
        //var modeljson = JSON.stringify(this.state.diagramValue);
        var modeljson = graphC.diagramValue;
        console.log("ReadDiagramData:");
        console.log(modeljson);
        myDiagram.model = go.Model.fromJson(modeljson);
    }

    onChangeName(e) { //当前箱号
        this.setState({
            currentName:e.target.value
        });
    }

    showSingle(){ //显示单箱计划输入框
        let _self = this;
        _self.setState({
            showSingle: !_self.state.showSingle,
            showArea: false
        });
    }
    
    showArea(){ //显示区域计划输入框
        let _self = this;
        _self.setState({
            showSingle: false,
            showArea: !_self.state.showArea
        });
    }

    collapse(){
        //var leftbar = document.getElementById("collapse");
        this.setState({
            collapse:!this.state.collapse
        });
    }

    constructor(props) {
        super(props)
        //状态值
        this.state = {
            mockdata:[],
            currentName:'', //当前箱号
            currentArea:'', //当前区域
            currentNum:'', //当前区域所含元素数
            showSingle: false, //是否展示单箱计划输入框
            showArea: false, //是否展示区域计划输入框
            showBox: false, //是否显示箱子信息
            collapse:false,
            showdiv:false
        }

        INIT.initDiagram = INIT.initDiagram.bind(this);
        INIT.initPlanSingle = INIT.initPlanSingle.bind(this);
        INIT.initPlanArea = INIT.initPlanArea.bind(this);
        this.showSingle = this.showSingle.bind(this);
        this.showArea = this.showArea.bind(this);
        //INIT.setSingle = INIT.setSingle.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
        this.collapse = this.collapse.bind(this);
    }

    componentDidMount () {
        this.renderCanvas ();
    }

    render() {
        var currentName = this.state.currentName;
        var currentArea = this.state.currentArea;
        var currentNum = this.state.currentNum;
        var showSingle = this.state.showSingle;
        var showArea = this.state.showArea;
        var showBox = this.state.showBox;
        var collapse = this.state.collapse;
        return (
            <div>
                <Row className="mainBack">
                    <Col span={4} className= {collapse?"pdRight pdLeft mini":"pdRight pdLeft"}>
                        <Row className={collapse?"hide":""}>
                            <Col span={24}>
                                <Button type="primary" className="loadBtn mgTop" onClick = {INIT.initDiagram} >实时展示箱场</Button>
                                <Button type="primary" className="showBtn" onClick = {this.showSingle} >单箱计划展示</Button>
                                <Button type="primary" className="showBtn" onClick = {this.showArea} >区域计划展示</Button>
                            </Col>
                        </Row>
                        <Row className={collapse?"hide planRow":"planRow"}>
                            <Col span={24} id="planSingle" className={showSingle ? "tlt" : "tlt hide"}>
                                <p className="paragraph">请输入箱号：</p>
                                <Input placeholder="箱号" value={currentName} onChange={this.onChangeName} />
                                <Button type="primary" className="showBtn" onClick = {INIT.initPlanSingle} >确认</Button>
                            </Col>
                            <Col span={24} id="planArea" className={showArea ? "tlt" : "tlt hide"}>
                                <p className="paragraph">请点击选择区域：</p>
                                <Input placeholder="箱区" value={currentArea} readOnly />
                                <Button type="primary" className="showBtn" onClick = {INIT.initPlanArea} >确认</Button>
                            </Col>
                        </Row>
                        <Row className={collapse?"hide":""}>
                            <p className="paragraph">画布控制：</p>
                            <Col span={24}>
                                <Button type="primary" shape="circle" onClick = {this.zoomOut} icon="plus" />
                                <Button type="primary" shape="circle" onClick = {this.zoomIn} icon="minus" />
                            </Col>
                        </Row>
                        <div id="collapse" className="collapse" onClick = {this.collapse}><Icon type={collapse ? "right-circle":"left-circle"} /></div>
                    </Col>
                    <Col span={20} className={collapse?"wide":""}>
                        <div style={{ background: '#fff', padding: 0, minHeight: 100, width: '100%' }}>
                            <div id="myDiagramDiv" 
                                style={{'width': '100%', 'height': '700px', 'backgroundColor': '#DAE4E4'}}
                                onMouseOver={this.showIndicators} 
                                onMouseOut={this.hideIndicators}
                            >
                            </div>
                            <div id="currentBox" className={showBox ? "showBox" : "showBox hide"}></div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default ShowGraph;