import React from 'react';
import { ScrollView, View, Platform } from 'react-native';
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
        {/* View et non <div> : le style est un style React Native (paddingHorizontal,
            flex en colonne, gap…) qu'une simple balise HTML ne comprend pas */}
        <View style={[{ flexGrow: 1 }, contentContainerStyle]} dataSet={{ anim: 'rise' }}>
          {children}
        </View>
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
