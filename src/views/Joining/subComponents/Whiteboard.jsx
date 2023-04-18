import React, { Component } from 'react';
import * as router from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  CButton,
  CCol,
  CDropdown, CDropdownToggle, CDropdownMenu, CDropdownItem,
  CTabPane,
  CRow,
  CSelect
} from '@coreui/react';

import _ from 'lodash';

import { withTranslation } from 'react-i18next';

import { FaUnderline,
        FaEdit,
        FaPen,
        FaEraser,
        FaShapes,
        FaTrash,
        FaFill,
        FaFont,
        FaBold,
        FaItalic,
        FaImage,
        FaBorderAll,
        FaMousePointer,
        FaBrush,
        FaSave,
        FaArrowLeft,
        FaStickyNote
        } from 'react-icons/fa';
import {GrZoomIn, GrZoomOut} from 'react-icons/gr';

import Konva from 'konva';
import { Stage, Layer, Rect, Circle, Wedge, Text, Transformer, Ellipse, Line, Image, Arrow } from 'react-konva';

import { SketchPicker } from 'react-color';
import WImage from './Image';

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};


class Handler extends React.Component {
  componentDidMount() {
    this.checkNode();
  }

  componentDidUpdate() {
    this.checkNode();
  }

  checkNode() {
    const stage = this.transformer.getStage();
    const { selected } = this.props;
    const selectedNode = stage.findOne("." + selected);
    if (selectedNode) {
      this.transformer.nodes([selectedNode]);
    } else {
      this.transformer.detach();
    }
    this.transformer.getLayer().batchDraw();
  }

  render() {
    return (
      <Transformer
        onTransformEnd={(e) => this.props.onTransformEnd(e)}
        ref={node => {
          this.transformer = node;
        }}
      />
    );
  }
}

class Whiteboard extends Component {
  constructor(props){
    super(props);

    this.handleTextEdit = this.handleTextEdit.bind(this);
    this.handleTextareaKeyDown = this.handleTextareaKeyDown.bind(this);

    this.selectFillColor = this.selectFillColor.bind(this);
    this.selectStrokeColor = this.selectStrokeColor.bind(this);
    this.selectStroke = this.selectStroke.bind(this);
    this.setFont = this.setFont.bind(this);
    this.setDoubleArrow = this.setDoubleArrow.bind(this);

    this.deleteShape = this.deleteShape.bind(this);
    this.stageClicked = this.stageClicked.bind(this);
    this.stageMouseDown = this.stageMouseDown.bind(this);
    this.stageMouseMove = this.stageMouseMove.bind(this);
    this.stageMouseUp = this.stageMouseUp.bind(this);

    this.setAction = this.setAction.bind(this);
    this.handleDragStart = this.handleDragStart.bind(this);
    this.handleDragEnd = this.handleDragEnd.bind(this);
    this.onTransformEnd = this.onTransformEnd.bind(this);
    this.syncWhiteboard = this.syncWhiteboard.bind(this);
    this.confirmation = this.confirmation.bind(this);
    this.setRef = this.setRef.bind(this);
    this.closeImage = this.closeImage.bind(this);
    this.createImage = this.createImage.bind(this);

    this.zoomIn = this.zoomIn.bind(this);
    this.zoomOut = this.zoomOut.bind(this);
    this.save = this.save.bind(this);
    this.prepareImageForRender = this.prepareImageForRender.bind(this);

    this.state = {
      action: null,
      scale: 1,
      selected: {
        name: "stage",
        index: null
      },
      color: {
        fill: "darkOrange",
        stroke: "darkBlue"
      },
      stroke: {
        width: 2
      },
      textArea: {
        index: null,
        editVisible: false,
        x: 0,
        y: 0,
        value: ''
      },
      font: {
        italic: false,
        bold: false,
        size: 12,
        underline: false,
        family: 'Arial'
      },
      doubleArrow: false,
      showImage: false,
    }
    this.textArea = React.createRef();
    this.stage = React.createRef();
  }

  handleTextEdit = e => {
    var state = this.state;
    state.textArea.value = e.target.value;
    this.setState(state);
  };

  handleTextareaKeyDown = e => {
    var state = this.state;
    var {whiteboard} = this.props;

    whiteboard[state.textArea.index].text = e.target.value;

    if (e.keyCode === 13) {
      state.textArea.editVisible = false;
      this.setState(state);
      this.syncWhiteboard(whiteboard);
    }
  };

  selectFillColor = (color) => {
    var state = this.state;
    state.color.fill = color.hex;
    if(!_.isNull(state.selected.index))
    {
        var {whiteboard} = this.props;
        whiteboard[state.selected.index].fill = state.color.fill;
        this.syncWhiteboard(whiteboard);
    }
    this.setState(state);
  }

  selectStrokeColor = (color) => {
    var state = this.state;
    state.color.stroke = color.hex;
    if(!_.isNull(state.selected.index))
    {
      var {whiteboard} = this.props;
      whiteboard[state.selected.index].stroke = state.color.stroke;
      this.syncWhiteboard(whiteboard);
    }
    this.setState(state);
  }

  selectStroke = (width) => {
    var state = this.state;
    state.stroke.width = width;
    if(!_.isNull(state.selected.index))
    {
      var {whiteboard} = this.props;
      whiteboard[state.selected.index].strokeWidth = width;
      this.syncWhiteboard(whiteboard);
    }
    this.setState(state);
  }

  setFont = (label, value) => {
    var state = this.state;
    state.font[label] = value;
    if(!_.isNull(state.selected.index))
    {
      var {whiteboard} = this.props;
      whiteboard[state.selected.index].font[label] = value;
      this.syncWhiteboard(whiteboard);
    }
    this.setState(state);
  }

  setDoubleArrow = (value) => {
    var state = this.state;
    state.doubleArrow = value;
    if(!_.isNull(state.selected.index))
    {
      var {whiteboard} = this.props;
      whiteboard[state.selected.index].doubleArrow = value;
      this.syncWhiteboard(whiteboard);
    }
    this.setState(state);
  }

  deleteShape = () => {
    var state = this.state;
    var {whiteboard} = this.props;

    if(whiteboard[state.selected.index].shape === 'text' && state.textArea.editVisible)
    {
        state.textArea.editVisible = false;
        state.textArea.index = null;
    }
    whiteboard.splice(state.selected.index,1);
    state.selected = {
      name: "stage",
      index: null
    };
    this.syncWhiteboard(whiteboard);
    this.setState(state);
  }

  stageClicked = (e) => {
    var state = this.state;
    var {whiteboard} = this.props;

    if(state.textArea.editVisible && e.target.name() !== state.selected.name){
      whiteboard[state.textArea.index].text = state.textArea.value;
      state.textArea.editVisible = false;
      state.textArea.index = null;
      this.syncWhiteboard(whiteboard);
    }

    if(state.action === 'pointer'){
      var found = false;
      state.selected.name = e.target.name();
      if(state.selected.name.indexOf('eraser') === 0)
      {
        state.selected.name = "stage";
      }

      whiteboard.map((item, index) => {
        if(item.name === state.selected.name){
          state.selected.index = index;
          found = true;
        }
        return item;
      });

      if(!_.isNull(state.selected.index))
      {
        state.color.fill = !_.isUndefined(whiteboard[state.selected.index].fill) ? whiteboard[state.selected.index].fill :  state.color.fill;
        state.color.stroke = whiteboard[state.selected.index].stroke;
        state.stroke.width = whiteboard[state.selected.index].strokeWidth;
      }

      if(found && whiteboard[state.selected.index].shape === 'text'){
        const absPos = e.target.getAbsolutePosition();
        state.textArea.editVisible = true;
        state.textArea.x = absPos.x < window.innerWidth/3 ? absPos.x + 200 : absPos.x - 200;
        state.textArea.y = absPos.y + 100;
        state.textArea.value = whiteboard[state.selected.index].text;
        state.textArea.index = state.selected.index;
      }
    }

    this.setState(state);
    if(found && whiteboard[state.selected.index].shape === 'text'){
      this.textArea.current.focus();
    }
  }

  stageMouseDown = (e) => {
    var state = this.state;

    if(this.props.user.email !== this.props.settings.whiteboard)
    {
      state.action = null;
      state.selected.name = 'stage';
      state.selected.index = null;
      this.setState(state);
      return false;
    }

    var {whiteboard} = this.props;

    if(_.isNull(state.selected.index) && !_.isNull(state.action))
    {
      switch(state.action){
        case 'rect':
          whiteboard.push({
            name: 'rect-' + whiteboard.length,
            shape: state.action,
            x: e.evt.layerX,
            y: e.evt.layerY,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            width: 5,
            height: 5,
            fill: state.color.fill,
            stroke: state.color.stroke,
            strokeWidth: state.stroke.width
          });
          break;
        case 'circle':
          whiteboard.push({
            name: 'circle-' + whiteboard.length,
            shape: state.action,
            x: e.evt.layerX,
            y: e.evt.layerY,
            scaleX: 1,
            scaleY: 1,
            rotation: 0,
            radius: 5,
            fill: state.color.fill,
            stroke: state.color.stroke,
            strokeWidth: state.stroke.width
          });
          break;
        case 'wedge':
            whiteboard.push({
              name: 'wedge-' + whiteboard.length,
              shape: state.action,
              x: e.evt.layerX,
              y: e.evt.layerY,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              radius: 5,
              angle: 60,
              fill: state.color.fill,
              stroke: state.color.stroke,
              strokeWidth: state.stroke.width
            });
          break;
        case 'ellipse':
            whiteboard.push({
              name: 'ellipse-' + whiteboard.length,
              shape: state.action,
              x: e.evt.layerX,
              y: e.evt.layerY,
              radiusX: 10,
              radiusY: 5,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              fill: state.color.fill,
              stroke: state.color.stroke,
              strokeWidth: state.stroke.width
            });
          break;
        case 'line':
            whiteboard.push({
              name: 'line-' + whiteboard.length,
              shape: state.action,
              x: e.evt.layerX,
              y: e.evt.layerY,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              points: [0,0],
              fill: state.color.fill,
              stroke: state.color.stroke,
              strokeWidth: state.stroke.width
            });
            break;
        case 'arrow':
              whiteboard.push({
                name: 'arrow-' + whiteboard.length,
                shape: state.action,
                x: e.evt.layerX,
                y: e.evt.layerY,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                points: [0,0],
                doubleArrow: state.doubleArrow,
                fill: state.color.fill,
                stroke: state.color.stroke,
                strokeWidth: state.stroke.width
              });
              break;
        case 'pen':
            whiteboard.push({
                name: 'pen-' + whiteboard.length,
                shape: state.action,
                x: e.evt.layerX,
                y: e.evt.layerY,
                scaleX: 1,
                scaleY: 1,
                rotation: 0,
                points: [0,0],
                fill: state.color.fill,
                stroke: state.color.stroke,
                strokeWidth: state.stroke.width
              });
            break;
        case 'eraser':
              whiteboard.push({
                  name: 'eraser-' + whiteboard.length,
                  shape: state.action,
                  x: e.evt.layerX,
                  y: e.evt.layerY,
                  scaleX: 1,
                  scaleY: 1,
                  rotation: 0,
                  points: [0,0],
                  fill: 'white',
                  stroke: 'white',
                  strokeWidth: state.stroke.width
                });
              break;
        case 'text':
                whiteboard.push({
                    name: 'text-' + whiteboard.length,
                    shape: state.action,
                    text: this.props.t('Whiteboard.labels.enter_text'),
                    x: e.evt.layerX,
                    y: e.evt.layerY,
                    scaleX: 1,
                    scaleY: 1,
                    rotation: 0,
                    font: _.clone(state.font),
                    stroke: state.color.stroke,
                    strokeWidth: state.stroke.width
                  });
                break;
        case 'note':
            whiteboard.push({
              name: 'note-' + whiteboard.length,
              shape: state.action,
              x: e.evt.layerX,
              y: e.evt.layerY,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              points: [0, 0, 10, 0, 11, 10, 0, 10],
              fill: state.color.fill,
              stroke: state.color.stroke,
              strokeWidth: state.stroke.width
            })
          break;
        default:
      }
      if(state.action !== 'pointer'){
        state.selected.index = whiteboard.length-1;
        this.syncWhiteboard(whiteboard);
        this.setState(state);
      }
    }
  }

  stageMouseMove = (e) => {
    var state = this.state;
    var {whiteboard} = this.props;

    if(!_.isNull(state.selected.index)){
      switch(state.action){
        case 'rect':
          whiteboard[state.selected.index].width = e.evt.layerX - whiteboard[state.selected.index].x;
          whiteboard[state.selected.index].height = e.evt.layerY - whiteboard[state.selected.index].y;
          if(whiteboard[state.selected.index].width < 0)
          {
            whiteboard[state.selected.index].x = whiteboard[state.selected.index].x + whiteboard[state.selected.index].width;
            whiteboard[state.selected.index].width = -whiteboard[state.selected.index].width;
          }
          if(whiteboard[state.selected.index].height < 0)
          {
            whiteboard[state.selected.index].y = whiteboard[state.selected.index].y + whiteboard[state.selected.index].height;
            whiteboard[state.selected.index].height = -whiteboard[state.selected.index].height;
          }
          break;
        case 'circle':
          whiteboard[state.selected.index].radius = Math.hypot(e.evt.layerX - whiteboard[state.selected.index].x,
                                                                       e.evt.layerY - whiteboard[state.selected.index].y);
          break;
        case 'wedge':
          whiteboard[state.selected.index].radius = Math.hypot(e.evt.layerX - whiteboard[state.selected.index].x,
                                                                        e.evt.layerY - whiteboard[state.selected.index].y);
          break;
        case 'ellipse':
          whiteboard[state.selected.index].radiusX = e.evt.layerX - whiteboard[state.selected.index].x;
          whiteboard[state.selected.index].radiusY = e.evt.layerY - whiteboard[state.selected.index].y;
          if(whiteboard[state.selected.index].radiusX < 0)
          {
            whiteboard[state.selected.index].x = whiteboard[state.selected.index].x + whiteboard[state.selected.index].radiusX;
            whiteboard[state.selected.index].radiusX = -whiteboard[state.selected.index].radiusX;
          }
          if(whiteboard[state.selected.index].radiusY < 0)
          {
            whiteboard[state.selected.index].y = whiteboard[state.selected.index].y + whiteboard[state.selected.index].radiusY;
            whiteboard[state.selected.index].radiusY = -whiteboard[state.selected.index].radiusY;
          }
          break;
        case 'line':
        case 'arrow':
          whiteboard[state.selected.index].points[2] = e.evt.layerX - whiteboard[state.selected.index].x;
          whiteboard[state.selected.index].points[3] = e.evt.layerY - whiteboard[state.selected.index].y;
          break;
        case 'pen':
        case 'eraser':
          whiteboard[state.selected.index].points.push(e.evt.layerX - whiteboard[state.selected.index].x);
          whiteboard[state.selected.index].points.push(e.evt.layerY - whiteboard[state.selected.index].y);
          break;
        case 'note':
          whiteboard[state.selected.index].points =
                            [0,0,
                            e.evt.layerX - whiteboard[state.selected.index].x, 0,
                            (e.evt.layerX - whiteboard[state.selected.index].x)*1.2, e.evt.layerY - whiteboard[state.selected.index].y,
                            0,e.evt.layerY - whiteboard[state.selected.index].y ];
          break;
        default:
      }
      this.props.syncMeeting({whiteboard: whiteboard});
    }
  }

  stageMouseUp = (e) => {
    var state = this.state;
    var {whiteboard} = this.props;

    if(state.action !== 'pointer' && !_.isNull(state.selected.index))
    {
      state.action = 'pointer';
      state.selected.index = null;
      this.syncWhiteboard(whiteboard);
      this.setState(state);
    }
  }

  setAction = (value) => {
    var state = this.state;
    state.action = value;
    state.selected.name = "stage";
    state.selected.index = null;
    if(state.textArea.editVisible)
    {
      var {whiteboard} = this.props;
      whiteboard[state.textArea.index].text = state.textArea.value;
      this.syncWhiteboard(whiteboard);

      state.textArea.editVisible = false;
      state.textArea.index = null;
    }
    this.setState(state);
  }

  handleDragStart = (e, index) => {
    var {whiteboard} = this.props;
    e.target.setAttrs({
      shadowOffset: {
        x: 30,
        y: 30
      },
      scaleX: 1.1 * whiteboard[index].scaleX,
      scaleY: 1.1 * whiteboard[index].scaleY
    });
  };

  handleDragEnd = (e, index) => {
    var state = this.state;
    var {whiteboard} = this.props;

    e.target.to({
      duration: 0.3,
      easing: Konva.Easings.ElasticEaseOut,
      scaleX: whiteboard[index].scaleX / 1.1,
      scaleY: whiteboard[index].scaleY / 1.1,
      shadowOffsetX: 0,
      shadowOffsetY:0
    });
    whiteboard[index].x = e.target.attrs.x;
    whiteboard[index].y = e.target.attrs.y;
    if(whiteboard[index].shape === 'text'){
        const absPos = e.target.getAbsolutePosition();
        state.textArea.x = absPos.x < window.innerWidth/3 ? absPos.x + 200 : absPos.x - 200;
        state.textArea.y = absPos.y + 100;
    }
    this.syncWhiteboard(whiteboard);
    this.setState(state);
  };

  onTransformEnd = (e) => {
    var state = this.state;
    var {whiteboard} = this.props;
    whiteboard[state.selected.index].rotation = _.isString(e.target.attrs.rotation) ? e.target.attrs.rotation : 0;
    whiteboard[state.selected.index].scaleX = e.target.attrs.scaleX;
    whiteboard[state.selected.index].scaleY = e.target.attrs.scaleY;
    this.syncWhiteboard(whiteboard);
    this.setState(state);
  }

  syncWhiteboard = (items) => {
    if(this.props.user.email === this.props.settings.whiteboard)
    {
      this.props.socket.emit('whiteboard', items, (res) => this.confirmation(res));
    }
  }

  confirmation = (res) => {
    if(res === "FAILED")
    {
      this.props.notify("danger","Execution.msgs.sync_not_sent");
    }
  }

  setRef = (key, ref) => {
    this[key] = ref;
  };

  closeImage = () => {
    var state = this.state;
    state.showImage = false;
    this.setState(state);
  }

  createImage = (image) => {
    var state = this.state;
    var {whiteboard} = this.props;

    whiteboard.push({
      name: 'image-'+whiteboard.length,
      shape: 'image',
      image: image,
      x: 10,
      y: 10,
      width: 100,
      height: 100,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      stroke: state.color.stroke,
      strokeWidth: state.stroke.width
    });
    state.showImage = false;
    state.action = "pointer";

    this.syncWhiteboard(whiteboard);
    this.setState(state);
  }

  save = () => {
    var dataURL = this.stage.getStage().toDataURL({ pixelRatio: 3 });
    const link = document.createElement('a');
    link.download = this.props.meeting.subject + '.png';
    link.href = dataURL;
    link.click();
    this.props.notify('info','Execution.msgs.whiteboard_saved_successfully');
  }

  zoomIn = () => {
    var state = this.state;
    state.scale = state.scale + 0.1;
    this.setState(state);
  }

  zoomOut = () => {
    var state = this.state;
    state.scale = state.scale - 0.1;
    this.setState(state);
  }

  prepareImageForRender = (image) =>{
    var img = new window.Image();
    img.src = image;
    return img
  }

  render() {
    const {t, whiteboard, settings, user, leftBar} = this.props;
    const {action, selected, color, stroke, textArea, font, doubleArrow, scale} = this.state;

    return (
            <CTabPane>
              <CRow className="pt-1 mb-1">

                <CCol className="col-6">
                {user.email === settings.whiteboard &&
                <>
                    {selected.name !== 'stage' &&
                      <CButton className="mr-1" onClick={() => this.deleteShape()} color="danger" variant="outline" size="sm"><FaTrash /></CButton>
                    }

                    {(selected.name !== 'stage' || (action !== 'eraser' && action !== 'pointer' && !_.isNull(action)) ) &&
                    <>
                      { (selected.name.indexOf("text") !== 0 && selected.name.indexOf("pen") !== 0 && selected.name.indexOf("line") !== 0 && selected.name.indexOf("arrow") !== 0
                          && action !== 'text' && action !== 'pen' && action !== 'line' && action !== 'arrow') &&
                        <CDropdown className="btn-group mr-1" size="sm">
                            <CDropdownToggle size="sm" variant="outline" style={{backgroundColor: color.fill}}>
                              <FaFill />
                            </CDropdownToggle>
                            <CDropdownMenu placement="bottom-end" size="sm">
                              <SketchPicker onChange={this.selectFillColor} color={color.fill} />
                            </CDropdownMenu>
                        </CDropdown>
                      }
                      { (selected.name.indexOf("text") === 0 || action === 'text') &&
                      <>
                        <CSelect
                            onChange={(e) => this.setFont('family', e.target.value)}
                            value = {font.family}
                            custom
                            size="sm"
                            className="col-3 mr-1"
                            >
                              <option value="arial">Arial</option>
                              <option value="baskerville">Baskerville</option>
                              <option value="comic">Comic</option>
                              <option value="courier">Courier</option>
                              <option value="Georgia">Georgia</option>
                              <option value="helvetica">Helvetica</option>
                              <option value="sans-serif">Sans Serif</option>
                              <option value="tahoma">Tahoma</option>
                              <option value="times">Times</option>
                              <option value="verdana">Verdana</option>
                            </CSelect>
                          <CSelect
                            onChange={(e) => this.setFont('size', e.target.value)}
                            value = {font.size}
                            custom
                            size="sm"
                            className="col-2 mr-1"
                            >
                              {[8,10,12,14,16,18,20,22,24,26,28,30,32,34,36].map((v) => (
                                <option value={v} key={'fontSize-'+v}>{v}</option>
                              ))}
                            </CSelect>

                        <CButton className="mr-1" onClick={() => this.setFont('underline', !font.underline)} color="primary" variant={font.underline ? '' : 'outline'} size="sm"><FaUnderline /></CButton>
                        <CButton className="mr-1" onClick={() => this.setFont('bold', !font.bold)} color="primary" variant={font.bold ? '' : 'outline'} size="sm"><FaBold /></CButton>
                        <CButton className="mr-1" onClick={() => this.setFont('italic', !font.italic)} color="primary" variant={font.italic ? '' : 'outline'}  size="sm"><FaItalic /></CButton>
                      </>
                      }
                      { (selected.name.indexOf("arrow") === 0 || action === 'arrow') &&
                        <CButton className="mr-1" onClick={() => this.setDoubleArrow(!doubleArrow)} color="primary" variant={ doubleArrow ? "" : "outline"} size="sm"><FaArrowLeft /></CButton>
                      }
                      <CDropdown className="btn-group mr-1" size="sm">
                          <CDropdownToggle size="sm" variant="outline" style={{backgroundColor: color.stroke}}>
                            { (selected.name.indexOf("text") === 0 || action === 'text')
                            ? <FaFont />
                            : <FaBorderAll />
                            }
                          </CDropdownToggle>
                          <CDropdownMenu placement="bottom-end" size="sm">
                            <SketchPicker onChange={this.selectStrokeColor} color={color.stroke} />
                          </CDropdownMenu>
                      </CDropdown>

                      { (selected.name.indexOf("text") !== 0 && action !== 'text') &&
                      <CDropdown className="btn-group mr-1 primary" size="sm">
                          <CDropdownToggle size="sm" variant="outline">
                            <FaBrush />
                          </CDropdownToggle>
                          <CDropdownMenu placement="bottom-end" size="sm">
                            {[2,4,6,8,10].map((v) => (
                              <CDropdownItem size="sm" key={'line-'+v} disabled={ stroke.width === v ? true : false} onClick={() => this.selectStroke(v)}>{v}</CDropdownItem>
                            ))}
                          </CDropdownMenu>
                      </CDropdown>
                      }
                  </>
                  }

                  {action === 'eraser' &&
                    <CDropdown className="btn-group mr-1 primary" size="sm">
                      <CDropdownToggle size="sm" color="primary" variant="outline">
                        <FaBrush />
                      </CDropdownToggle>
                      <CDropdownMenu placement="bottom-end" size="sm">
                        {[2,4,6,8,10].map((v) => (
                          <CDropdownItem key={'line-'+v} disabled={ stroke.width === v ? true : false} onClick={() => this.selectStroke(v)}>{v}</CDropdownItem>
                        ))}
                      </CDropdownMenu>
                  </CDropdown>
                  }
                </>
                }
                </CCol>

                <CCol className="col-6 text-right">
                  {user.email === settings.whiteboard &&
                  <>
                  <CButton className="mr-1" disabled={action === 'pointer' ? true : false} onClick={() => this.setAction('pointer')} color="primary" variant="outline" size="sm"><FaMousePointer /></CButton>
                  <CButton className="mr-1" disabled={action === 'pen' ? true : false} onClick={() => this.setAction('pen')} color="primary" variant="outline" size="sm"><FaPen /></CButton>
                  <CButton className="mr-1" disabled={action === 'eraser' ? true : false} onClick={() => this.setAction('eraser')} color="primary" variant="outline" size="sm"><FaEraser /></CButton>
                  <CButton className="mr-1" disabled={action === 'text' ? true : false} onClick={() => this.setAction('text')} color="primary" variant="outline" size="sm"><FaEdit /></CButton>
                  <CButton className="mr-1" disabled={action === 'image' ? true : false} onClick={() => this.setState({showImage: true})} color="primary" variant="outline" size="sm"><FaImage /></CButton>
                  <CButton className="mr-1" disabled={action === 'note' ? true : false} onClick={() => this.setAction('note')} color="primary" variant="outline" size="sm"><FaStickyNote /></CButton>
                  <CDropdown className="btn-group" size="sm">
                        <CDropdownToggle size="sm" variant="outline" color="primary">
                          <FaShapes />
                        </CDropdownToggle>
                        <CDropdownMenu placement="bottom-end" size="sm">
                          <CDropdownItem disabled={action === 'arrow' ? true : false} onClick={() => this.setAction('arrow')}>{t("Whiteboard.labels.arrow")}</CDropdownItem>
                          <CDropdownItem disabled={action === 'line' ? true : false} onClick={() => this.setAction('line')}>{t("Whiteboard.labels.line")}</CDropdownItem>
                          <CDropdownItem disabled={action === 'circle' ? true : false} onClick={() => this.setAction('circle')}>{t("Whiteboard.labels.circle")}</CDropdownItem>
                          <CDropdownItem disabled={action === 'ellipse' ? true : false} onClick={() => this.setAction('ellipse')}>{t("Whiteboard.labels.ellipse")}</CDropdownItem>
                          <CDropdownItem disabled={action === 'rect' ? true : false} onClick={() => this.setAction('rect')}>{t("Whiteboard.labels.rect")}</CDropdownItem>
                          <CDropdownItem disabled={action === 'wedge' ? true : false} onClick={() => this.setAction('wedge')}>{t("Whiteboard.labels.triangle")}</CDropdownItem>
                        </CDropdownMenu>
                  </CDropdown>
                  </>
                  }
                  <CButton className="ml-2" disabled={whiteboard.length === 0 || scale === 2 ? true : false} onClick={() => this.zoomIn()} color="primary" variant="outline" size="sm"><GrZoomIn /></CButton>
                  <CButton className="ml-1" disabled={whiteboard.length === 0 || scale === 0.1 ? true : false} onClick={() => this.zoomOut()} color="primary" variant="outline" size="sm"><GrZoomOut /></CButton>
                  <CButton className="ml-1" disabled={whiteboard.length === 0 ? true : false} onClick={() => this.save()} color="primary" variant="outline" size="sm"><FaSave /></CButton>
                </CCol>

              </CRow>

              <Stage name="stage"
                ref={node => { this.stage = node}}
                onClick={this.stageClicked}

                onMouseDown={this.stageMouseDown}
                onTouchStart={this.stageMouseDown}

                onMouseMove={this.stageMouseMove}
                onTouchMove={this.stageMouseMove}

                onTouchEnd={this.stageMouseUp}
                onMouseUp={this.stageMouseUp}

                scaleX={scale}
                scaleY={scale}

                width={leftBar ? window.innerWidth*0.6 : window.innerWidth*0.92}
                height={window.innerHeight*0.72}
                className="border-primary mt-1 p-1">
                <Layer>
                  {whiteboard.map((item,index) => (
                    <React.Fragment key={"shape-" + index}>
                      {item.shape === 'circle' &&
                          <Circle
                            name={item.name}
                            rotation={item.rotation}
                            x={item.x}
                            y={item.y}
                            radius={item.radius}
                            fill={item.fill}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                            scaleX={item.scaleX}
                            scaleY={item.scaleY}
                            draggable={action === 'pointer' && selected.name !== 'stage'  ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                          />
                      }
                      {item.shape === 'rect' &&
                          <Rect
                            name={item.name}
                            rotation={item.rotation}
                            x={item.x}
                            y={item.y}
                            width={item.width}
                            height={item.height}
                            fill={item.fill}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                            cornerRadius={2}
                            scaleX={item.scaleX}
                            scaleY={item.scaleY}
                            draggable={action === 'pointer' && selected.name !== 'stage'  ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                            />
                      }
                      {item.shape === 'wedge' &&
                          <Wedge
                            name={item.name}
                            rotation={item.rotation}
                            x={item.x}
                            y={item.y}
                            radius={item.radius}
                            angle={item.angle}
                            fill={item.fill}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                            scaleX={item.scaleX}
                            scaleY={item.scaleY}
                            draggable={action === 'pointer' && selected.name !== 'stage'  ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                            />
                      }
                      {item.shape === 'ellipse' &&
                          <Ellipse
                            name={item.name}
                            rotation={item.rotation}
                            x={item.x}
                            y={item.y}
                            radiusX={item.radiusX}
                            radiusY={item.radiusY}
                            fill={item.fill}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                            scaleX={item.scaleX}
                            scaleY={item.scaleY}
                            draggable={action === 'pointer' && selected.name !== 'stage'  ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                            />
                      }
                      {item.shape === 'arrow' &&
                          <Arrow
                            name={item.name}
                            rotation={item.rotation}
                            x={item.x}
                            y={item.y}
                            points={item.points}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                            scaleX={item.scaleX}
                            scaleY={item.scaleY}
                            lineCap='round'
                            lineJoin='round'
                            pointerAtBeginning={item.doubleArrow}
                            draggable={action === 'pointer' && selected.name !== 'stage'  ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                            />
                      }
                      {['line','eraser','pen'].indexOf(item.shape) >= 0 &&
                          <Line
                            name={item.name}
                            rotation={item.rotation}
                            x={item.x}
                            y={item.y}
                            points={item.points}
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                            scaleX={item.scaleX}
                            scaleY={item.scaleY}
                            lineCap='round'
                            lineJoin='round'
                            draggable={item.shape === 'eraser' || (action === 'pointer' && selected.name !== 'stage') ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                            />
                      }
                      {item.shape === 'note' &&
                           <Line
                            name={item.name}
                            rotation={item.rotation}

                            x={item.x}
                            y={item.y}
                            points={item.points}
                            tension={0.2}
                            closed
                            stroke={item.stroke}
                            strokeWidth={item.strokeWidth}
                            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                            fillLinearGradientEndPoint={{ x: 10, y: 10 }}
                            fillLinearGradientColorStops={[0, 'silver', 1, item.fill]}

                            draggable={action === 'pointer' && selected.name !== 'stage' ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                         />
                      }
                      {item.shape === 'text' &&
                          <Text
                            name={item.name}
                            rotation={item.rotation}
                            text={item.text}
                            x={item.x}
                            y={item.y}
                            fontFamily={item.font.family}
                            textDecoration={item.font.underline ? 'underline': ''}
                            fontSize={_.toInteger(item.font.size)}
                            fontStyle={(item.font.italic?'italic ':' ') + (item.font.bold ?'bold':'')}
                            stroke={item.stroke}
                            scaleX={item.scaleX}
                            scaleY={item.scaleY}
                            draggable={action === 'pointer' && selected.name !== 'stage' ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                            />
                      }
                      {item.shape === 'image' &&
                          <Image
                            name={item.name}
                            rotation={item.rotation}
                            image={this.prepareImageForRender(item.image)}
                            x={item.x}
                            y={item.y}
                            width={item.width}
                            height={item.height}
                            stroke={item.stroke}
                            scaleX={item.scaleX}
                            scaleY={item.scaleY}
                            draggable={action === 'pointer' && selected.name !== 'stage' ? true : false}
                            onDragStart={(e) => this.handleDragStart(e, index)}
                            onDragEnd={(e) => this.handleDragEnd(e, index)}
                            ref={refElem => this.setRef(item.name, refElem)}
                            />
                      }
                    </React.Fragment>
                  ))}
                  {user.email === settings.whiteboard &&
                    <Handler selected={selected.name} onTransformEnd={(e) => this.onTransformEnd(e)} />
                  }
                </Layer>
              </Stage>
              {user.email === settings.whiteboard &&
                <textarea
                  value={textArea.value}
                  style={{
                    display: textArea.editVisible ? 'block' : 'none',
                    position: 'absolute',
                    left: textArea.x + 'px',
                    top: textArea.y + 'px'
                  }}
                  ref={this.textArea}
                  onChange={this.handleTextEdit}
                  onKeyDown={this.handleTextareaKeyDown}
                />
              }
              <WImage closeImage={this.closeImage} show={this.state.showImage} createImage={this.createImage} />
            </CTabPane>
    );
  }
}

Whiteboard.propTypes = propTypes;
Whiteboard.defaultProps = defaultProps;

export default withTranslation()(router.withRouter(Whiteboard));
