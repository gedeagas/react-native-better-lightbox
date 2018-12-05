//@flow
import React, {Component, Children, cloneElement} from 'react';
import {Animated, TouchableHighlight, View, Platform} from 'react-native';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';

import ZoomAndroid from './Plugins/ZoomAndroid';
import ZoomIos from './Plugins/ZoomIos';

import Overlay from './Core/Overlay';

type Props = {
  activeProps: *,
  renderHeader?: () => mixed,
  renderContent?: () => mixed,
  underlayColor?: string,
  backgroundColor?: string,
  didOpen: () => mixed,
  onOpen: () => mixed,
  willClose: () => mixed,
  onClose: () => mixed,
  springConfig?: {
    tension: number,
    friction: number,
  },
  style?: ViewStyleProp,
  pinchToZoom: boolean,
  swipeToDismiss: boolean,
  children: React$Element<*>,
};

type State = {
  isOpen: boolean,
  isAnimating: boolean,
  origin: {
    x: number,
    y: number,
    width: number,
    height: number,
  },
  layoutOpacity: any,
};

export default class Lightbox extends Component<Props, State> {
  _root: ?View;

  static defaultProps = {
    swipeToDismiss: true,
    onOpen: () => {},
    didOpen: () => {},
    willClose: () => {},
    onClose: () => {},
    pinchToZoom: false,
  };

  state = {
    isOpen: false,
    isAnimating: false,
    origin: {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    },
    layoutOpacity: new Animated.Value(1),
  };

  getContent = () => {
    if (this.props.renderContent) {
      return this.props.renderContent();
    } else if (this.props.activeProps) {
      return cloneElement(
        Children.only(this.props.children),
        this.props.activeProps
      );
    }
    return this.props.children;
  };

  getOverlayProps = () => ({
    isOpen: this.state.isOpen,
    origin: this.state.origin,
    renderHeader: this.props.renderHeader,
    swipeToDismiss: this.props.swipeToDismiss,
    springConfig: this.props.springConfig,
    backgroundColor: this.props.backgroundColor,
    children: this.getContent(),
    didOpen: this.props.didOpen,
    willClose: this.props.willClose,
    onClose: this.onClose,
  });

  open = () => {
    this._root &&
      this._root.measure((ox, oy, width, height, px, py) => {
        this.props.onOpen();

        this.setState(
          {
            isOpen: false,
            isAnimating: true,
            origin: {
              width,
              height,
              x: px,
              y: py,
            },
          },
          () => {
            this.props.didOpen();
            this.setState({
              isOpen: true,
            });
            setTimeout(() => {
              this._root && this.state.layoutOpacity.setValue(0);
            });
          }
        );
      });
  };

  close = () => {
    throw new Error(
      'Lightbox.close method is deprecated. Use renderHeader(close) prop instead.'
    );
  };

  onClose = () => {
    this.state.layoutOpacity.setValue(1);
    this.setState(
      {
        isOpen: false,
      },
      this.props.onClose
    );
  };

  WrapperChildren = () => {
    if (this.props.pinchToZoom) {
      return Platform.OS === 'ios' ? (
        <ZoomIos>{this.props.children}</ZoomIos>
      ) : (
        <ZoomAndroid>{this.props.children}</ZoomAndroid>
      );
    }
    return this.props.children;
  };

  render() {
    // measure will not return anything useful if we dont attach a onLayout handler on android
    return (
      <View
        ref={component => (this._root = component)}
        style={this.props.style}
        onLayout={() => {}}>
        <Animated.View style={{opacity: this.state.layoutOpacity}}>
          <TouchableHighlight
            underlayColor={this.props.underlayColor}
            onPress={this.open}>
            {this.WrapperChildren()}
          </TouchableHighlight>
        </Animated.View>
        <Overlay {...this.getOverlayProps()} />
      </View>
    );
  }
}
