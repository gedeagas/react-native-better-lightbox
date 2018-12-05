//@flow
import React, {PureComponent} from 'react';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';
import {ScrollView, StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
});

type Props = {
  style?: ViewStyleProp,
  children: React$Element<*>,
  minimumZoomScale: number,
  maximumZoomScale: number,
};

export default class Zoomable extends PureComponent<Props> {
  static defaultProps = {
    minimumZoomScale: 1,
    maximumZoomScale: 3,
  };

  render() {
    return (
      <ScrollView
        centerContent
        contentContainerStyle={styles.contentContainer}
        maximumZoomScale={this.props.maximumZoomScale}
        minimumZoomScale={this.props.minimumZoomScale}
        style={this.props.style || styles.container}>
        {this.props.children}
      </ScrollView>
    );
  }
}
