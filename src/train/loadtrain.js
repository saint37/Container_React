import React, { Component } from 'react';
import go from 'gojs';
import containerimg from '../assets/container-green.png'
import truckimg from '../assets/truck.png'
import trainimg from '../assets/train.png'

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
        //global
        function showMessage(s) {
            document.getElementById("diagramEventsMsg").textContent = s;
        }

        function isBox(group, node) { //拖拽对象只能为顶层箱子
            if (node instanceof go.Group) return false;  // don't add Groups to Groups
            else if ((node.data.layer != node.containingGroup.memberParts.count) && node.data.layer != 0) return false; 
            else return true;
        };

        function placebox(box,grp,n) {
            box.position.x = grp.position.x;
            box.position.y = grp.position.y + 40*(3-n);
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function placetruck(box,grp,n) {
            box.position.x = grp.position.x + 60;
            box.position.y = grp.position.y;
            box.moveTo(box.position.x,box.position.y);
            //改变data中的pos，同position保持一致
            box.data.pos = go.Point.stringify(new go.Point(box.position.x, box.position.y));
        }

        function placetrain(box,grp,n) {
            box.position.x = grp.position.x + 20 + (n-1)*80;
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
            //allowDrop: true, // 可以释放拖拽对象
            //allowDragOut: true, //可以拖出
            //"draggingTool.isGridSnapEnabled": true, // 对齐网格拖拽
            maxSelectionCount: 1, //最多选择一个节点
        });

        myDiagram.groupTemplateMap.add("OfGroups", //划分箱区，集卡，火车区域
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
                    },
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                //Point.parse允许位置以字符串（“100 50”）的形式来指定，而不是作为一个表达式的点。
                //Point.stringify可以将位置信息输出成字符串string类型，用node.data.pos来取。
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "color"),
                  new go.Binding("stroke", "stroke")),
            ));

        myDiagram.groupTemplateMap.add("OfNodes", //箱位
            $(go.Group, "Auto",
                {
                    layerName: "BoxArea",
                    resizable:  false, //不能改变大小
                    movable: false, //不能移动
                    memberValidation: isBox, 
                    defaultAlignment: go.Spot.Bottom,
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
                    mouseDragLeave: function(e, grp, next) { highlightGroup(grp, false); },
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
                    mouseDragLeave: function(e, grp, next) { highlightGroup(grp, false); },
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
                    },
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: "transparent",
                    stroke: "transparent",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : "transparent"; }).ofObject()),
                $(go.Picture,
                    { 
                        margin: 0, width: 140, height: 40, background: "transparent", alignment: go.Spot.BottomCenter
                    },
                    new go.Binding("source", "url")),
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
                    mouseDragLeave: function(e, grp, next) { highlightGroup(grp, false); },
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
                            }
                            else{ showMessage("can't move"); grp.diagram.currentTool.doCancel();}
                        }
                    },
                },
                new go.Binding("position", "pos", go.Point.parse).makeTwoWay(go.Point.stringify),
                $(go.Shape, "Rectangle",
                  { name: "SHAPE", // 取名
                    fill: "transparent",
                    stroke: "transparent",
                  },
                  new go.Binding("desiredSize", "size", go.Size.parse),
                  new go.Binding("fill", "isHighlighted", function(h) { return h ? dropFill : "transparent"; }).ofObject()),
                $(go.Picture,
                    { 
                        margin: 0, width: 200, height: 20, background: "transparent", alignment: go.Spot.BottomCenter
                    },
                    new go.Binding("source", "url")),
            ));

        myDiagram.nodeTemplate = //定义箱子
            $(go.Node, "Auto",
                {   selectionAdorned: false,
                    click: function(e, node) { 
                        var data = node.data;
                        showMessage(node.key + "-" + data.group + ":" + node.position + "/" + data.pos); 
                        //通过key获取node对象
                        //var obj = myDiagram.findNodeForKey("B1");
                        //console.log(obj);
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
                        margin: 0, width: 80, height: 40, background: "gray"
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

        var myModel = $(go.GraphLinksModel);
        myModel.nodeDataArray = [
                {"key":"truckArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 0", "size":"1200 180", "color":"#95c3bf","stroke":"rgba(128,128,128,0.4)"},
                {"key":"BoxArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 200", "size":"1200 480", "color":"#9bab88","stroke":"rgba(128,128,128,0.4)"},
                {"key":"trainArea", "isGroup":true, "category":"OfGroups", 
                    "pos":"0 700", "size":"1200 180", "color":"#758790","stroke":"rgba(128,128,128,0.4)"},
                { key: "G1", isGroup: true, group:"BoxArea", "category":"OfNodes", size: "80 120","pos":"0 200" },
                { key: "G2", isGroup: true, group:"BoxArea", "category":"OfNodes", size: "80 120","pos":"100 200" },
                { key: "G3", isGroup: true, group:"BoxArea", "category":"OfNodes", size: "80 120","pos":"200 200" },
                { key: "G4", isGroup: true, group:"BoxArea", "category":"OfNodes", size: "80 120","pos":"300 200" },
                { key: "G5", isGroup: true, group:"BoxArea", "category":"OfNodes", size: "80 120","pos":"400 200" },
                { key: "G6", isGroup: true, group:"BoxArea", "category":"OfNodes", size: "80 120","pos":"500 200" },
                { key: "T1", isGroup: true, group:"truckArea", "category":"OfTruck", size: "140 50", url:truckimg },
                { key: "T2", isGroup: true, group:"truckArea", "category":"OfTruck", size: "140 50", url:truckimg },
                { key: "T3", isGroup: true, group:"truckArea", "category":"OfTruck", size: "140 50", url:truckimg },
                { key: "T4", isGroup: true, group:"truckArea", "category":"OfTruck", size: "140 50", url:truckimg },
                { key: "T5", isGroup: true, group:"truckArea", "category":"OfTruck", size: "140 50", url:truckimg },
                { key: "T6", isGroup: true, group:"truckArea", "category":"OfTruck", size: "140 50", url:truckimg },
                { key: "Tr1", isGroup: true, group:"trainArea", "category":"OfTrain", size: "200 60", url:trainimg },
                { key: "Tr2", isGroup: true, group:"trainArea", "category":"OfTrain", size: "200 60", url:trainimg },
                { key: "Tr3", isGroup: true, group:"trainArea", "category":"OfTrain", size: "200 60", url:trainimg },
                { key: "Tr4", isGroup: true, group:"trainArea", "category":"OfTrain", size: "200 60", url:trainimg },
                { key: "B1", group: "G1", size: "80 40", url:containerimg, layer: 2,"pos":"0 240" },
                { key: "B2", group: "G1", size: "80 40", url:containerimg, layer: 1,"pos":"0 280" },
                { key: "B3", group: "G3", size: "80 40", url:containerimg, layer: 1,"pos":"200 280" },
                { key: "B4", group: "G4", size: "80 40", url:containerimg, layer: 1,"pos":"300 280" },
        ];
        myDiagram.model = myModel;

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
    }

    componentDidMount () {
        this.renderCanvas ();
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

    render() {
        return (
            <div>
                <div id="diagramEventsMsg">msg</div>
                <div style={{ background: '#fff', padding: 0, minHeight: 100, width: 1400 }}>
                    <div id="myDiagramDiv" 
                        style={{'width': '1400px', 'height': '800px', 'backgroundColor': '#DAE4E4'}}
                        onMouseOver={this.showIndicators} 
                        onMouseOut={this.hideIndicators}
                    ></div>
                </div>
            </div>
        );
    }
}

export default LoadTrain;