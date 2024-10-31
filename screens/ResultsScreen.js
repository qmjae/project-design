import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Image, FlatList, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define width outside of the component and StyleSheet
const { width } = Dimensions.get('window');

export default function ResultsScreen({ navigation, route }) {
  const { files } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event) => {
    const offset = event.nativeEvent.contentOffset.x;
    const activeIndex = Math.round(offset / width);
    setActiveIndex(activeIndex);
  };

  const PaginationDots = () => {
    return (
      <View style={styles.paginationContainer}>
        {files.map((_, index) => (
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
  };

  const renderItem = ({ item }) => (
    <View style={[styles.resultCard, { width: width - 40 }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Thermal Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.imageUri }} 
            style={styles.thermalImage}
            resizeMode="contain"
          />
        </View>
        
        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Module Info */}
          <View style={styles.moduleInfo}>
            <Text style={styles.moduleTitle}>Defect Name</Text>
            <Text style={styles.moduleSubtitle}>(crystalline Si)</Text>
          </View>

          {/* Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Stress factors:</Text>
              <Text style={styles.value}>Lorem Ipsum</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Priority Level:</Text>
              <Text style={styles.value}>Lorem Ipsum</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Power Loss:</Text>
              <Text style={styles.value}>Lorem Ipsum</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Category:</Text>
              <Text style={styles.value}>Lorem Ipsum</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.label}>CoA:</Text>
              <Text style={styles.value}>Lorem Ipsum</Text>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description:</Text>
              <Text style={styles.sectionText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </Text>
            </View>

            {/* Recommendation */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommendation:</Text>
              <Text style={styles.sectionText}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
               </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Button Container - Outside ScrollView */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.resolvedButton}>
          <Text style={styles.resolvedButtonText}>Resolved</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={35} color="black" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Results</Text>
        </View>
      </View>

      <FlatList
        data={files}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate={0.98}
        snapToInterval={width}
        contentContainerStyle={styles.flatListContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      <PaginationDots />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25,
    position: 'relative',
  },
  backButton: {
    marginRight: 15,
    zIndex: 1,
    position: 'absolute',
    left: 20,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 29,
    fontWeight: '500',
    color: '#FFD700',
  },
  content: {
    flex: 1,
  },
  resultCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    height: 750,
    width: width - 40,
    marginHorizontal: width * 0.02,
    position: 'relative',
  },
  imageContainer: {
    height: 200,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    overflow: 'hidden',
  },
  thermalImage: {
    width: '100%',
    height: '100%',
  },
  moduleInfo: {
    marginTop: 15,
    marginBottom: 10,
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  moduleSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  detailsContainer: {
    flex: 1,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 100,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  section: {
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600', 
    color: '#333',
    marginBottom: 5,
  },
  sectionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  flatListContent: {
    paddingHorizontal: width * 0.02,
  },
  contentContainer: {
    flexGrow: 1,
  },
  scrollContent: {
    paddingBottom: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'white',
  },
  resolvedButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resolvedButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
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