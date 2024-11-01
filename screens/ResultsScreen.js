import React, { useState, useCallback } from 'react';
import { SafeAreaView, FlatList, Dimensions, StyleSheet } from 'react-native';
import { HeaderResults } from '../components/results/HeaderResults';
import { ResultCard } from '../components/results/ResultCard';
import { PaginationDots } from '../components/results/PaginationDots';

const { width } = Dimensions.get('window');

export default function ResultsScreen({ navigation, route }) {
  const { files } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback((event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / width);
    setActiveIndex(activeIndex);
  }, []);

  const renderItem = useCallback(({ item }) => (
    <ResultCard item={item} width={width} />
  ), []);

  const getItemLayout = useCallback((_, index) => ({
    length: width,
    offset: width * index,
    index,
  }), []);

  return (
    <SafeAreaView style={styles.container}>
      <HeaderResults onBack={() => navigation.goBack()} />

      <FlatList
        data={files}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={width}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={2}
        windowSize={3}
      />

      <PaginationDots totalDots={files.length} activeIndex={activeIndex} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});