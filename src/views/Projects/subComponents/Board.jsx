import React, { Component } from 'react';

import {
  CButton,
  CCard,CCardBody,
  CCol,
  CInput,
  CInputGroup,
  CInputGroupPrepend,
  CInputGroupText,
  CRow,
  CBadge,
  CSelect
} from '@coreui/react';
import {
  CIcon
} from '@coreui/icons-react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {FaElementor} from 'react-icons/fa';
import { withTranslation } from 'react-i18next';
import PropTypes from "prop-types";

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const propTypes = {
  children: PropTypes.node,
};

const defaultProps = {};

class Board extends Component {
  constructor(props) {
    super(props);

    this.state = {
      values: {
        item: "",
        status: "show"
      },
      edit: false,
    }
    this.onDragEnd = this.onDragEnd.bind(this);
    this.addItem = this.addItem.bind(this);
    this.editItem = this.editItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.getItemStyle = this.getItemStyle.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  componentDidUpdate(prevProps, prevState){
    if(this.props.initializeComponents)
    {
      var state = this.state;
      state.values = {
        item: "",
        status: "show"
      };
      state.edit = false;
      this.props.componentsInitialized();
    }
  }

  handleInputChange = (event) => {
    const { value, name } = event.target;
    var state = this.state;
    state.values[name] = value;
    this.setState(state);
  }

  getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    padding: 5,
    margin: `0 0 5px 0`,
    background: isDragging ? "beige" : "whitesmoke",
    ...draggableStyle
  });

  addItem = () => {
    var state = this.state;
    var items = this.props.board;

    if(state.values.item.match(/[A-Za-z0-9]+/))
    {
        if(state.edit !== false)
        {
          items[state.edit].item = state.values.item;
          items[state.edit].status = state.values.status;
        }
        else
        {
          items.push({
            item: state.values.item,
            status: state.values.status
          });
        }
        this.props.setBoard(items);

        state.values.item = "";
        state.values.status = "show";
        state.edit = false;
    }
    else{
      state.errors.item = true;
    }
    this.setState(state);
  }

  editItem = (index) => {
    var state = this.state;
    state.edit = index;
    state.values = {
      item: this.props.board[index].item,
      status: this.props.board[index].status
    }
    this.setState(state);
  }

  deleteItem = (index) => {
    var items = this.props.board;
    items.splice(index,1);
    this.props.setBoard(items);
  }
  onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    var items = this.props.board;
    items = reorder(
      items,
      result.source.index,
      result.destination.index
    );
    this.props.setBoard(items);
  }

  render() {
    const {t, board} = this.props;
    const {values, edit} = this.state;

    return (
            <>
                {edit === false &&
                <>
                  <CInputGroup className="mb-1 mt-1">
                      <CInputGroupPrepend>
                          <CInputGroupText>
                            <FaElementor  />
                          </CInputGroupText>
                      </CInputGroupPrepend>
                      <CInput
                          type="text"
                          name="item"
                          placeholder={t("Board.labels.add_item")}
                          value={values.item}
                          autoComplete="off"
                          onChange={this.handleInputChange}
                          maxLength="100"
                          size="sm"
                      />
                      <CSelect
                        name="status"
                        custom
                        size="sm"
                        className="text-left col-3"
                        value={values.status}
                        onChange={this.handleInputChange}
                      >
                        <option value="show">{t("Board.labels.show")}</option>
                        <option value="hide">{t("Board.labels.hide")}</option>
                      </CSelect>
                      <CButton color="primary" size="sm" onClick={this.addItem} className="ml-2" disabled={values.item.match(/[0-9A-Za-z]{2}/) ? false : true}>
                        {t("General.buttons.add")}
                      </CButton>
                  </CInputGroup>
                </>
                }
                {board.length > 0 &&
                   <CCard>
                    <CCardBody>
                      <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable-agenda">
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                            {board.map((item, index) => (
                              <Draggable key={"item-" + index} draggableId={"item-" + index} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={this.getItemStyle(
                                      snapshot.isDragging,
                                      provided.draggableProps.style
                                  )}
                                >
                                  <CRow>
                                    {edit === index
                                      ?
                                        <>
                                          <CInputGroup className="mb-1 ml-4">
                                              <CInput
                                                  type="text"
                                                  name="item"
                                                  placeholder={t("Board.labels.edit_item")}
                                                  value={values.item}
                                                  autoComplete="off"
                                                  onChange={this.handleInputChange}
                                                  maxLength="100"
                                                  size="sm"
                                                  className={!values.item.match(/[0-9A-Za-z]{2}/) ? "is-invalid col-6" : " col-6"}
                                              />
                                              <CSelect
                                                name="status"
                                                custom
                                                size="sm"
                                                className="text-left col-3"
                                                value={values.status}
                                                onChange={this.handleInputChange}
                                              >
                                                <option value="show">{t("Board.labels.show")}</option>
                                                <option value="hide">{t("Board.labels.hide")}</option>
                                              </CSelect>
                                              <CButton color="primary" size="sm" onClick={this.addItem} className="ml-3" disabled={values.item.match(/[0-9A-Za-z]{2}/) ? false : true}>
                                                {t("General.buttons.update")}
                                              </CButton>
                                          </CInputGroup>
                                        </>
                                      :
                                        <>
                                          <CCol className="col-1 font-weight-bold">
                                              {index+1}
                                          </CCol>
                                          <CCol className="col-6">
                                            {item.item}
                                          </CCol>
                                          <CCol className="col-2">
                                            <CBadge color={item.status === 'show' ? 'info' : 'secondary'}>{t("Board.labels." + item.status)}</CBadge>
                                          </CCol>
                                          <CCol className="col-3 text-right">
                                            {edit === false &&
                                            <>
                                              <CButton color="primary" size="sm" onClick={(event => this.editItem(index))}>
                                                <CIcon name="cil-pencil"/>
                                              </CButton>
                                              <CButton color="danger" className="ml-1" size="sm" onClick={(event => this.deleteItem(index))}>
                                                <CIcon name="cil-x"/>
                                              </CButton>
                                            </>
                                            }
                                          </CCol>
                                        </>
                                    }
                                  </CRow>
                                </div>
                              )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </CCardBody>
                  </CCard>
                }
            </>
          );
    }
}

Board.propTypes = propTypes;
Board.defaultProps = defaultProps;

export default withTranslation()(Board);
