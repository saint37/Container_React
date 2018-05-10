import React, { Component } from 'react';
import axios from 'axios';
import go from 'gojs';
import './train.css';
import { Row, Col, Button, Input, Modal, DatePicker } from 'antd';
import INIT from './init';
import PLAN from './plan';
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

class LoadTrain extends Component {
    renderCanvas () {
        let _self = this;
        //global
        function showMessage(s) {
            console.log(s);
        }

        function isBox(group, node) { //拖拽对象只能为顶层箱子
            if (node instanceof go.Group) return false;  // don't add Groups to Groups
            else if ((node.data.layer !== node.containingGroup.memberParts.count) && node.data.layer !== 0) return false; 
            else return true;
        };

        function placebox(box,grp,n) {
            box.position.x = grp.position.x;
            box.position.y = grp.position.y + 20*(3-n);
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function placetruck(box,grp,n) {
            box.position.x = grp.position.x + 30;
            box.position.y = grp.position.y + 10;
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function placetrain(box,grp,n) {
            box.position.x = grp.position.x + 10 + (n-1)*40;
            box.position.y = grp.position.y + 5;
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

        myDiagram = //定义画布
        $(go.Diagram, "myDiagramDiv",
        {
            //"toolManager.mouseWheelBehavior":go.ToolManager.WheelNone,//鼠标滚轮事件禁止
            //initialContentAlignment: go.Spot.Center, // 画布居中
            //显示网格
            grid: $(go.Panel, "Grid",
              { gridCellSize: CellSize },
              $(go.Shape, "LineH", { stroke: "lightgray" }),
              $(go.Shape, "LineV", { stroke: "lightgray" })
            ),
            scrollMode: go.Diagram.InfiniteScroll,  // 可以滚动
            padding: 0,  // 边距为0
            "undoManager.isEnabled": true, // 可以撤销
            allowZoom: true, // 可以缩放
            //initialAutoScale: go.Diagram.Uniform,
            initialScale:0.8,
            initialContentAlignment: go.Spot.Center,
            //allowDrop: true, // 可以释放拖拽对象
            //allowDragOut: true, //可以拖出
            //"draggingTool.isGridSnapEnabled": true, // 对齐网格拖拽
            maxSelectionCount: 1, //最多选择一个节点
            "SelectionDeleted":function (e) { //删除节点时，更新state记录的json
                var node = e.subject.first();
                console.log(node);
            },
        });

        myDiagram.groupTemplateMap.add("OfGroups", //划分箱区
            $(go.Group, "Horizontal",
                {
                    layerName: "Background",
                    movable: false, //不能移动
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) { //不能拖拽节点到区域上
                        grp.diagram.currentCursor = "not-allowed";
                    },
                    mouseDrop: function(e, grp) {
                        showMessage("can't move"); 
                        grp.diagram.currentTool.doCancel();
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                //Point.parse允许位置以字符串（“100 50”）的形式来指定，而不是作为一个表达式的点。
                //Point.stringify可以将位置信息输出成字符串string类型，用node.data.pos来取。
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
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
                       console.log(node);
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) { //不能拖拽节点到区域上
                        grp.diagram.currentCursor = "not-allowed";
                    },
                    mouseDrop: function(e, grp) {
                        showMessage("can't move"); 
                        grp.diagram.currentTool.doCancel();
                    },
                    layout: //默认横向排列
                        $(go.GridLayout,
                          { wrappingColumn: NaN, 
                            alignment: go.GridLayout.Position,
                        })
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
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
                    memberValidation: isBox, 
                    defaultAlignment: go.Spot.Bottom,
                    computesBoundsAfterDrag: true,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                       console.log(node);
                    },
                    mouseDragEnter: function(e, grp, prev) { 
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            highlightGroup(grp, true); 
                        }
                    },
                    mouseDragLeave: function(e, grp, next) {
                        highlightGroup(grp, false);
                        var box = grp.diagram.toolManager.draggingTool.currentPart;
                        PLAN.setCurrentState(_self,box,grp); 
                    },
                    mouseDrop: function(e, grp) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            grp.addMembers(grp.diagram.selection, true); //绑定箱到新箱位
                            var box = grp.diagram.toolManager.draggingTool.currentPart;
                            var boxnum = grp.memberParts.count; //当前箱位所含箱数
                            console.log(boxnum);
                            showMessage( box.key + "-Droped at-" + grp.key + " on " + grp.position + "/" + grp.data.pos);
                            if(boxnum <= 3){
                                placebox(box,grp,boxnum);
                                box.data.layer = boxnum;
                            }
                            else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}      
                        }
                        else {grp.diagram.currentTool.doCancel();}
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
                //$(go.Placeholder, { padding: 0 }),
            ));

        myDiagram.groupTemplateMap.add("OfTruck", //集卡
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    //movable: false, //不能移动
                    memberValidation: isBox,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            highlightGroup(grp, true); 
                        }
                    },
                    mouseDragLeave: function(e, grp, next) { 
                        highlightGroup(grp, false); 
                        var box = grp.diagram.toolManager.draggingTool.currentPart;
                        PLAN.setCurrentState(_self,box,grp); 
                    },
                    mouseDrop: function(e, grp) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            grp.addMembers(grp.diagram.selection, true); //绑定箱到集卡
                            var box = grp.diagram.toolManager.draggingTool.currentPart;
                            var boxnum = grp.memberParts.count; //当前集卡所含箱数
                            console.log(boxnum);
                            showMessage( box.key + "-Droped at-" + grp.key + " on " + grp.position + "/" + grp.data.pos);
                            if(boxnum <= 1){
                                placetruck(box,grp,boxnum);
                                box.data.layer = 0;
                            }
                            else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}      
                        }
                        else {grp.diagram.currentTool.doCancel();}
                    }
                },
                //new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { 
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
                    //movable: false, //不能移动
                    memberValidation: isBox,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            highlightGroup(grp, true); 
                        }
                    },
                    mouseDragLeave: function(e, grp, next) { 
                        highlightGroup(grp, false);
                        var box = grp.diagram.toolManager.draggingTool.currentPart;
                        //PLAN.setCurrentState(_self,box,grp); 
                    },
                    mouseDrop: function(e, grp) {
                        if (grp.canAddMembers(grp.diagram.selection)) {
                            grp.addMembers(grp.diagram.selection, true); //绑定箱到集卡
                            var box = grp.diagram.toolManager.draggingTool.currentPart;
                            var boxnum = grp.memberParts.count; //当前集卡所含箱数
                            console.log(boxnum);
                            showMessage( box.key + "-Droped at-" + grp.key + " on " + grp.position + "/" + grp.data.pos);
                            if(boxnum <= 2){
                                placetrain(box,grp,boxnum);
                                box.data.layer = 0;
                                if(box.data.isPlan == "1"){
                                    PLAN.showUpdate(_self,box,grp);
                                }
                                else{
                                    PLAN.showAdd(_self,box,grp);
                                }
                            }
                            else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}
                        }
                    },
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  {
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
                    //movable: false, //不能移动
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
                {   selectionAdorned: true,
                    click: function(e, node) { 
                        var data = node.data;
                        showMessage(node.key + "-" + data.group + ":" + node.position + "/" + data.pos); 
                        PLAN.setSingle(_self,node);
                    },
                    mouseDrop: function(e, node) { 
                        // disallow dropping anything onto an "item"
                        showMessage("can't move");
                        node.diagram.currentTool.doCancel();
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

    getCurrentPos(grp,n){ //获取节点原位置
      var cGrp = myDiagram.findNodeForKey(grp);
      var x = cGrp.position.x;
      var y = cGrp.position.y + 20*(3-n);
      x = x.toFixed(2);
      y = y.toFixed(2);
      var str = x + " " + y;
      return str;
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

    onChange(value, dateString) { //改变时间
        console.log('Formatted Selected Time: ', dateString);
        this.setState({
          planTime: dateString
        });
    }

    onOk(value) {
        console.log('onOk: ', value);
    }

    onChangeName(value) { //当前箱号
      this.setState({currentName: value});
    }

    constructor(props) {
        super(props)
        //状态值
        this.state = {
            mockdata:[],
            title:'装火车',
            currentName:'', //当前箱号
            planTime:'', //计划时间
            currentPos:'',
            currentGroup:'',
            currentLayer:'',
            oldPos:'',
            oldGroup:'',
            oldLayer:'',
            newPos:'',
            newGroup:'',
            newLayer:'',
            showAdd: false, //是否展示新增计划输入框
            showUpdate: false, //是否展示更改计划输入框
            showSingle: false
        }

        INIT.initDiagram = INIT.initDiagram.bind(this);
        PLAN.showAdd = PLAN.showAdd.bind(this);
        PLAN.hideAdd = PLAN.hideAdd.bind(this);
        PLAN.AddPlan = PLAN.AddPlan.bind(this);
        PLAN.showSingle = PLAN.showSingle.bind(this);
        PLAN.setSingle = PLAN.setSingle.bind(this);
        PLAN.initPlanSingle = PLAN.initPlanSingle.bind(this);
        PLAN.showUpdate = PLAN.showUpdate.bind(this);
        PLAN.hideUpdate = PLAN.hideUpdate.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onChangeName = this.onChangeName.bind(this);
    }

    componentDidMount () {
        this.renderCanvas ();
    }

    render() {
        var title = this.state.title;
        var currentName = this.state.currentName;
        var currentPos = this.state.currentPos;
        var currentGroup = this.state.currentGroup;
        var currentLayer = this.state.currentLayer;
        var oldPos = this.state.oldPos;
        var oldGroup = this.state.oldGroup;
        var oldLayer = this.state.oldLayer;
        var newPos = this.state.newPos;
        var newGroup = this.state.newGroup;
        var newLayer = this.state.newLayer;
        var showSingle = this.state.showSingle;
        return (
            <div>
                <Row style = {{ padding:8, textAlign:'left' }}>
                    <Col span={2}>
                        <h2 style = {{ fontWeight:600 }}>{title}</h2>
                    </Col>
                    <Col span={10}>
                        <Button type="primary" onClick = {this.zoomOut} style = {{ marginRight:8 }}>放大</Button>
                        <Button type="primary" onClick = {this.zoomIn} style = {{ marginRight:8 }} >缩小</Button>
                        <Button type="primary" onClick = {this.zoomOri} style = {{ marginRight:8 }} >原始大小</Button>
                    </Col>
                    <Col span={12} className="trt">
                        <Button type="primary" onClick = {INIT.clickalert} style = {{ marginRight:8 }} >测试</Button>
                        <Button type="primary" onClick = {INIT.initDiagram} style = {{ marginRight:8 }} >实时展示箱场</Button>
                        <Button type="primary" onClick = {PLAN.infoAdd} style = {{ marginRight:8 }} >新增计划</Button>
                        <Button type="primary" onClick = {PLAN.showSingle} >更新计划</Button>
                    </Col>
                </Row>
                <Row className="planRow">
                    <Col span={24} id="planSingle" className={showSingle ? "trt" : "trt hide"}>
                        <span>请输入或点击获取箱号：</span>
                        <Input placeholder="箱号" value={currentName} onChange={this.onChangeName} />
                        <Button type="primary" onClick = {PLAN.initPlanSingle} >确认</Button>
                    </Col>
                </Row>
                <Modal
                  title="新增计划"
                  visible={this.state.showAdd}
                  onOk={PLAN.AddPlan}
                  onCancel={PLAN.hideAdd}
                  okText="确认"
                  cancelText="取消"
                >
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">箱号：</Col>
                        <Col span={18}><Input placeholder="箱号" value={currentName} readOnly/></Col>
                    </Row>
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">计划时间：</Col>
                        <DatePicker
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="选择计划时间"
                          onChange={this.onChange}
                          onOk={this.onOk}
                        />
                    </Row>
                    <Row className="AddplanRow">
                        {currentPos}<span>-</span>{currentGroup}<span>-</span>{currentLayer}<br/>
                        {newPos}<span>-</span>{newGroup}<span>-</span>{newLayer}
                    </Row>
                </Modal>
                <Modal
                  title="修改计划"
                  visible={this.state.showUpdate}
                  onOk={PLAN.UpdatePlan}
                  onCancel={PLAN.hideUpdate}
                  okText="确认"
                  cancelText="取消"
                >
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">箱号：</Col>
                        <Col span={18}><Input placeholder="箱号" value={currentName} readOnly/></Col>
                    </Row>
                    <Row className="AddplanRow">
                        <Col span={6} className="lable">计划时间：</Col>
                        <DatePicker
                          showTime
                          format="YYYY-MM-DD HH:mm:ss"
                          placeholder="选择计划时间"
                          onChange={this.onChange}
                          onOk={this.onOk}
                        />
                    </Row>
                    <Row className="AddplanRow">
                        {currentPos}<span>-</span>{currentGroup}<span>-</span>{currentLayer}<br/>
                        {oldPos}<span>-</span>{oldGroup}<span>-</span>{oldLayer}<br/>
                        {newPos}<span>-</span>{newGroup}<span>-</span>{newLayer}
                    </Row>
                </Modal>
                <Row>
                    <Col span={24}>
                        <div style={{ background: '#fff', padding: 0, minHeight: 100, width: 1400 }}>
                            <div id="myDiagramDiv" 
                                style={{'width': '1400px', 'height': '800px', 'backgroundColor': '#DAE4E4'}}
                                onMouseOver={this.showIndicators} 
                                onMouseOut={this.hideIndicators}
                            ></div>
                        </div>
                    </Col>
                </Row>
            </div>
        );
    }
}

export default LoadTrain;