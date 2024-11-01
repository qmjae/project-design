import React from 'react';
import { View, StyleSheet } from 'react-native';

export const PaginationDots = ({ totalDots, activeIndex }) => (
  <View style={styles.paginationContainer}>
    {Array(totalDots).fill().map((_, index) => (
      <View
        key={index}
        style={[
          styles.paginationDot,
          index === activeIndex && styles.paginationDotActive
        ]}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#FFD700',
    width: 12,
    height: 12,
    borderRadius: 6,
  },
}); 