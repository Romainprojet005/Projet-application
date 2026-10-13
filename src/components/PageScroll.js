import React from 'react';
import { ScrollView, Platform } from 'react-native';
import { FULL_HEIGHT } from '../utils/fullHeight';

export default function PageScroll({ children, contentContainerStyle, keyboardShouldPersistTaps, ...props }) {
  if (Platform.OS === 'web') {
    return (
      <div style={{
        height: FULL_HEIGHT,
        overflowY: 'scroll',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div style={contentContainerStyle}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps={keyboardShouldPersistTaps}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
