import React, { Component } from 'react';
import axios from 'axios';
import go from 'gojs';
import './diygraph.css';
import { Row, Col, Button, Collapse } from 'antd';
import containerimg from '../assets/container-green.png';

const Panel = Collapse.Panel;
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
//palette
var myPaletteArea;
var myPaletteItems;

class LoadTrain extends Component {
    renderCanvas () {
        //global
        function showMessage(s) {
            document.getElementById("diagramEventsMsg").textContent = s;
        }

        myDiagram = //定义画布
        $(go.Diagram, "myDiagramDiv",
        {
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
            initialScale:0.6,
            initialContentAlignment: go.Spot.Center,
            allowDrop: true, // 可以释放拖拽对象
            //allowDragOut: true, //可以拖出
            "draggingTool.isGridSnapEnabled": true, // 对齐网格拖拽
            "resizingTool.isGridSnapEnabled": true,
            maxSelectionCount: 1, //最多选择一个节点
        });

        myDiagram.groupTemplate =
            $(go.Group, "Auto",
                { layout: $(go.LayeredDigraphLayout,
                    { direction: 90, columnSpacing: 10 }
                )},
            $(go.Panel, "Vertical",  // position header above the subgraph
                { padding: 10 },
                $(go.Shape, "Rectangle",  // surrounds everything
                    new go.Binding("desiredSize", "size-sm", go.Size.parse),
                    new go.Binding("fill", "color"),
                    new go.Binding("stroke", "stroke")),
                $(go.TextBlock,     // group title near top, next to button
                    { font: "Bold 12pt Sans-Serif",margin:10 },
                    new go.Binding("text", "name"))
                )
            );

        myDiagram.groupTemplateMap.add("OfGroups", //划分箱区，集卡，火车区域
            $(go.Group, "Horizontal",
                {
                    layerName: "Background",
                    movable: true, //能移动
                    resizable:true, //能改变大小
                    selectionAdorned: true, //显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key+ "-Size: " + data.size + "-Loc: " + node.position + "/" + data.pos); 
                    },
                    mouseDragEnter: function(e, grp, prev) { //不能拖拽节点到区域上
                        grp.diagram.currentCursor = "not-allowed";
                    },
                    mouseDrop: function(e, grp) {
                        showMessage("can't move"); 
                        grp.diagram.currentTool.doCancel();
                    },
                },
                new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE" },
                  new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Point.stringify),
                  new go.Binding("fill", "color"),
                  new go.Binding("stroke", "stroke")),
            ));

        myDiagram.groupTemplateMap.add("OfNodes", //箱位
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    defaultAlignment: go.Spot.Bottom,
                    selectionAdorned: false, //选中后不显示选中框
                    click: function(e, node) {
                       var data = node.data;
                       showMessage(node.key + "-Current Loc of Group " + node.position + "/" + data.pos); 
                       console.log(node);
                    },
                    mouseDragEnter: function(e, grp, prev) { //在箱场图形自定义页，箱位仅做展示作用
                        grp.diagram.currentCursor = "not-allowed";
                    },
                    mouseDrop: function(e, grp) {
                        showMessage("can't move"); 
                        grp.diagram.currentTool.doCancel();
                    }
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: groupFill,
                    stroke: groupStroke,
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse)),
            ));

        //Palette 箱场布局
        myPaletteArea =
          $(go.Palette, "myPaletteArea",
            { // share the templates with the main Diagram
              nodeTemplate: myDiagram.nodeTemplate,
              groupTemplate: myDiagram.groupTemplate,
              layout: $(go.GridLayout)
            });

        // specify the contents of the Palette
        myPaletteArea.model = new go.GraphLinksModel([
            {"key":"TruckArea","name":"集卡", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 0", "size-sm":"122 10","size":"1220 100", "color":"#95c3bf","stroke":"rgba(128,128,128,0.4)"},
            {"key":"BoxArea", "name":"箱区", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 120", "size-sm":"60 42","size":"600 420", "color":"#9bab88","stroke":"rgba(128,128,128,0.4)"},
            {"key":"TrainArea", "name":"股道", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 560", "size-sm":"122 6","size":"1220 60", "color":"#758790","stroke":"rgba(128,128,128,0.4)"},
            {"key":"CraneArea", "name":"龙门吊轨道", "isGroup":true, "category":"OfGroups", 
                    "pos":"-20 540", "size-sm":"126 1","size":"1260 10", "color":"#333","stroke":"rgba(128,128,128,0.4)"},       
        ]);

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

    initBoxArea() {
        alert("不会写！")
    }

    load() {
        //var modeljson = JSON.stringify(this.state.diagramValue);
        var modeljson = this.state.diagramValue;
        console.log("ReadDiagramData:");
        console.log(modeljson);
        myDiagram.model = go.Model.fromJson(modeljson);
    }

    constructor(props) {
        super(props)
        //状态值
        this.state = {
            diagramValue:{
              "class": "go.GraphLinksModel",
              "nodeDataArray": [
                {"key":"CraneArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"-20 110", "size":"1260 10", "color":"#333","stroke":"rgba(128,128,128,0.4)"},
                {"key":"CraneArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"-20 540", "size":"1260 10", "color":"#333","stroke":"rgba(128,128,128,0.4)"},
                {"key":"TruckArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 0", "size":"1220 100", "color":"#95c3bf","stroke":"rgba(128,128,128,0.4)"},
                {"key":"BoxArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 120", "size":"600 420", "color":"#9bab88","stroke":"rgba(128,128,128,0.4)"},
                {"key":"BoxArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"620 120", "size":"600 420", "color":"#9bab88","stroke":"rgba(128,128,128,0.4)"},
                {"key":"TrainArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 560", "size":"1220 60", "color":"#758790","stroke":"rgba(128,128,128,0.4)"}
              ],
              "linkDataArray": []
            },
            mockdata:[]
        }
    }

    componentDidMount () {
        this.renderCanvas ();
    }

    render() {
        return (
            <div>
                <Row style = {{ padding:8, textAlign:'left' }}>
                    <Col span={4}></Col>
                    <Col span={8}>
                        <Button type="primary" onClick = {this.zoomOut} style = {{ marginRight:8 }}>放大</Button>
                        <Button type="primary" onClick = {this.zoomIn} style = {{ marginRight:8 }} >缩小</Button>
                        <Button type="primary" onClick = {this.zoomOri} style = {{ marginRight:8 }} >原始大小</Button>
                        <Button type="primary" onClick = {this.initBoxArea} style = {{ marginRight:8 }} >模拟箱位</Button>
                    </Col>
                    <Col span={12}><div id="diagramEventsMsg">msg</div></Col>
                </Row>
                <Row style = {{ padding:8 }}>
                    <Col span={4} style = {{ paddingRight:10 }}>
                        <div id="myPaletteArea" className="paletteArea"></div>
                    </Col>
                    <Col span={20}>
                        <div style={{ background: '#fff', padding: 0, minHeight: 100, width: 1200 }}>
                            <div id="myDiagramDiv" 
                                style={{'width': '1200px', 'height': '800px', 'backgroundColor': '#DAE4E4'}}
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